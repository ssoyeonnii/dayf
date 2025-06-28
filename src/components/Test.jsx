import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { useState } from "react";
// import { Buffer } from "buffer"; // stream to string 변환에 사용

function Test() {
  const [userName, setUserName] = useState("");
  //const accessKeyId: import.meta.env.MY_AWS_ACCESS_KEY;
  //const secretAccessKey: import.meta.env.MY_AWS_SECRET_KEY;

  //   const s3Client = new S3Client({
  //     region: "ap-northeast-2",
  //     credentials: {
  //       accessKeyId: import.meta.env.MY_AWS_ACCESS_KEY,
  //       secretAccessKey: import.meta.env.MY_AWS_SECRET_KEY,
  //     },
  //   });

  const BUCKET = import.meta.env.REACT_APP_AWS_BUCKET_NAME;
  const FILE_KEY = "test/user/user.json"; // 고정 경로

  console.log(accessKeyId, secretAccessKey, BUCKET, FILE_KEY);

  //   const uploadUserName = async () => {
  //     let existingData = [];

  //     try {
  //       // S3에서 기존 파일 불러오기
  //       const getCommand = new GetObjectCommand({
  //         Bucket: BUCKET,
  //         Key: FILE_KEY,
  //       });
  //       const getResult = await s3Client.send(getCommand);

  //       const bodyContents = await streamToString(getResult.Body);
  //       existingData = JSON.parse(bodyContents);
  //     } catch (err) {
  //       if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) {
  //         console.log("기존 user.json이 없으므로 새로 생성합니다.");
  //         existingData = []; // 파일이 없을 경우 빈 배열로 초기화
  //       } else {
  //         console.error("파일 불러오기 실패:", err);
  //         return;
  //       }
  //     }

  //     // 사용자 이름 추가
  //     const updatedData = [...existingData, userName];

  //     try {
  //       // 파일 덮어쓰기
  //       const putCommand = new PutObjectCommand({
  //         Bucket: BUCKET,
  //         Key: FILE_KEY,
  //         Body: JSON.stringify(updatedData),
  //         ContentType: "application/json",
  //       });
  //       await s3Client.send(putCommand);
  //       console.log("user.json 저장 완료");
  //     } catch (err) {
  //       console.error("저장 실패:", err);
  //     }
  //   };

  //   // S3 stream to string 변환 유틸
  //   const streamToString = async (stream) => {
  //     const chunks = [];
  //     for await (const chunk of stream) {
  //       chunks.push(chunk);
  //     }
  //     return Buffer.concat(chunks).toString("utf-8");
  //   };

  return (
    <div>
      <input
        type="text"
        name="userName"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
      />
      <button onClick={uploadUserName}>저장</button>
    </div>
  );
}

export default Test;
