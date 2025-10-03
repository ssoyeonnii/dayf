// 백엔드 서버 파일 
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

//초기화 미들웨어
const app = express(); //express app 인스턴스 생성
app.use(express.json()); //JSON 파싱 미들웨어 , 프런트에서 POST로 {code:....}보낼 때 req.body로 읽을 수 있게 함
app.use(cors({ origin: 'http://localhost:5173', credentials: true })); //프런트(5173)에서 오는 요청을 허용하고, 쿠키/인증 헤더 등의 자격 증명 허용

// Supabase server client (use Service Role key)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

app.post('/oauth/google/exchange', async (req, res) => {
  try {
    const { code } = req.body;

    // 구글 토큰 교환
    const tokenRes = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI, // GCP 콘솔과 동일해야 함
        grant_type: 'authorization_code',
        scope: 'email profile openid',
        access_type: 'offline'
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const tokens = tokenRes.data; // { access_token, refresh_token, id_token, ... }

    // ID 토큰에서 사용자 정보 추출(간단 파싱)
    const base64 = tokens.id_token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    const user = {
      email: payload.email,
      name: payload.name,
      google_sub: payload.sub,
    };

    // DB에 refresh_token 저장 및 사용자 upsert (백엔드에서만 처리, 프론트에서는 세션 저장만)
    if (supabase) {
      // 기본 사용자 정보 upsert
      const upsertPayload = {
        user_id: user.email,
        user_name: user.name,
        google_sub: user.google_sub,
      };
      if (tokens.refresh_token) {
        upsertPayload.refresh_token = tokens.refresh_token;
        //refresh token : 첫 로그인, refresh 토큰 무효화 등으로 새 토큰이 발급 될 경우 갱신됨
      }
      const { error: upsertError } = await supabase
        .from('work_users')
        .upsert(upsertPayload, { onConflict: 'google_sub' });
      if (upsertError) {
        console.error('Supabase upsert failed:', upsertError);
      }
    } else {
      console.warn('Supabase env not set. Skipping DB upsert.');
    }

    // 프런트로 최소 정보 반환 (access_token만 전달; refresh_token은 서버(DB)에 보관)
    res.json({ user, access_token: tokens.access_token });
  } catch (e) {
    console.error(e.response?.data || e.message);
    res.status(500).send('exchange failed');
  }
});

app.listen(3000, () => {
  console.log('API on http://localhost:3000');
});