import React from "react";
import "./Modal.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function SettingModal({
  isOpen,
  onClose,
  shiftConfig,
  setShiftConfig,
  onDateClick,
}) {
  const handleSave = () => {
    // Save the settings and close the modal
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? "open" : ""}`} onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal_header_txt">사용자 설정</div>
          <button className="modal_close" onClick={onClose}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15px"
              viewBox="0 0 384 512"
            >
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>
              교대근무 형태
              <select>
                <option value="4" selected>
                  4조3교대
                </option>
                <option value="3">3조2교대</option>
                <option value="2">2조2교대</option>
              </select>
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <label>
                주간 휴무일
                <input type="text" placeholder="2" />
              </label>
              <label>
                야간 휴무일
                <input type="text" placeholder="2" />
              </label>
              <label>
                오후 휴무일
                <input type="text" placeholder="1" />
              </label>
            </div>

            <label>
              공휴일 휴무 여부
              <input type="checkbox" />
            </label>
            <label>
              교대근무 계산 시작일자
              <input
                type="text"
                readOnly
                // placeholder={
                //   shiftConfig.startDate
                //     ? shiftConfig.startDate.toLocaleDateString()
                //     : "날짜 선택"
                // }
                onClick={onDateClick}
              />
              <input type="hidden" />
            </label>
            <div>
              <label>
                시작일자의 근무형태
                <select>
                  <option value="" selected>
                    선택
                  </option>
                  <option value="day">주간</option>
                  <option value="night">야간</option>
                  <option value="evening">오후</option>
                </select>
              </label>
              <label>
                <input type="text" placeholder="4" />
                번째 날
              </label>
            </div>
            {/* <label>
            Shift Type:
            <select
              value={shiftConfig.shiftType}
              onChange={(e) =>
                setShiftConfig({ ...shiftConfig, shiftType: e.target.value })
              }
            >
              <option value="type1">Type 1</option>
              <option value="type2">Type 2</option>
            </select>
          </label> */}
          </div>
          <div className="modal_button_group">
            <button type="submit" class="modal_btn modal_btn_save">
              저장하기
            </button>
            {/* <button
                type="button"
                class="modal_btn modal_btn_cancel"
                onClick={onClose}
              >
                취소
              </button> */}
          </div>
        </form>
      </div>
    </div>
  );
}

export default SettingModal;
