from fastapi import FastAPI, WebSocket, Depends, HTTPException, Request
import jwt  # คุณต้องติดตั้ง PyJWT ก่อน: pip install PyJWT
import cv2
import os
import pickle
import face_recognition
import numpy as np
import cvzone
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db
from firebase_admin import storage
from datetime import datetime
import time
from face_checker import FaceCheckwahummanjinba
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.security import OAuth2PasswordBearer
import base64
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageDraw, ImageFont
import json
from fastapi.websockets import WebSocketState  # เพิ่มการนำเข้าที่นี่

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ปรับได้ตามต้องการ เช่น ["http://localhost", "http://example.com"]
    allow_credentials=True,
    allow_methods=["*"],  # ปรับให้เป็นเฉพาะ method ที่ต้องการ
    allow_headers=["*"],  # ปรับให้เป็นเฉพาะ headers ที่ต้องการ
)

# Initialize Jinja2 templates
templates = Jinja2Templates(directory="C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/templates")

# Initialize Firebase
cred = credentials.Certificate("C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/try/serviceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'databaseURL': "https://face-recognition-3e9a6-default-rtdb.asia-southeast1.firebasedatabase.app/",
    'storageBucket': "face-recognition-3e9a6.appspot.com"
})

bucket = storage.bucket()

# def add_thai_text(img, text, position, font_size=32, color=(50, 50, 50)):
#     """
#     Add Thai text to an OpenCV image
#     Parameters:
#         img: OpenCV image (numpy array)
#         text: Thai text string
#         position: tuple of (x, y) coordinates
#         font_size: size of the font
#         color: tuple of (B, G, R) color values
#     Returns:
#         Image with Thai text
#     """
#     # แปลง OpenCV image (BGR) เป็น RGB สำหรับ PIL
#     img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
#     # แปลงเป็น PIL Image
#     pil_img = Image.fromarray(img_rgb)
    
#     # สร้าง object สำหรับวาดบน PIL Image
#     draw = ImageDraw.Draw(pil_img)
    
#     try:
#         # ลองโหลดฟอนต์ไทยจากระบบ (Windows)
#         font = ImageFont.truetype("C:\\Windows\\Fonts\\THSarabun.ttf", font_size)
#     except:
#         try:
#             # ลองโหลดฟอนต์ไทยจากระบบ (Windows) - ฟอนต์สำรอง
#             font = ImageFont.truetype("C:\\Windows\\Fonts\\tahoma.ttf", font_size)
#         except:
#             # ถ้าไม่มีฟอนต์ไทยให้ใช้ฟอนต์เริ่มต้น
#             font = ImageFont.load_default()
    
#     # วาดข้อความภาษาไทย
#     draw.text(position, text, font=font, fill=color)
    
#     # แปลงกลับเป็น OpenCV image (BGR)
#     result_img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
    
#     return result_img

# # แก้ไขส่วนการแสดงข้อความในฟังก์ชัน process_image_frame
# def process_image_frame(img, classroomId):
#     global imgBackground, modeType, counter, studentInfo, imgStudent
    
#     # ... (โค้ดส่วนอื่นๆ คงเดิม) ...

#     if counter <= 10:
#         # แสดงจำนวนการเข้าเรียน
#         imgBackground = add_thai_text(
#             imgBackground,
#             str(studentInfo['total_attendance']),
#             (861, 125),
#             font_size=32
#         )
        
#         # แสดงสาขา
#         imgBackground = add_thai_text(
#             imgBackground,
#             str(studentInfo.get('major', 'ไม่ระบุ')),
#             (1006, 550),
#             font_size=16
#         )
        
#         # แสดงรหัสนักศึกษา
#         imgBackground = add_thai_text(
#             imgBackground,
#             str(studentId),
#             (1006, 493),
#             font_size=16
#         )
        
#         # แสดงสถานะการเข้าเรียน
#         imgBackground = add_thai_text(
#             imgBackground,
#             str(studentInfo['standing']),
#             (910, 625),
#             font_size=20,
#             color=(100, 100, 100)
#         )
        
#         # แสดงชื่อ-นามสกุล
#         name_text = str(studentInfo['name-lastname'])
#         # คำนวณตำแหน่งกึ่งกลางสำหรับชื่อ
#         font = ImageFont.truetype("C:\\Windows\\Fonts\\THSarabun.ttf", 32)
#         text_width = font.getlength(name_text)
#         center_x = 808 + (414 - text_width) // 2
        
#         imgBackground = add_thai_text(
#             imgBackground,
#             name_text,
#             (int(center_x), 445),
#             font_size=32,
#             color=(50, 50, 50)
#         )

# Load Background and Modes
imgBackground = cv2.imread('C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/Resources/background.png')
if imgBackground is None:
    raise ValueError("Background image not found or failed to load.")
file_path = 'C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/EncodeFile.p'
print(f"Loading encode file from: {os.path.abspath(file_path)}")
folderModePath = 'C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/Resources/Modes'
modePathList = os.listdir(folderModePath)
imgModeList = []
for path in modePathList:
    img = cv2.imread(os.path.join(folderModePath, path))
    if img is None:
        raise ValueError(f"Mode image {path} not found or failed to load.")
    imgModeList.append(img)

# Load Encode File
print("Loading Encode File ...")
with open('C:\\Users\\natna\\OneDrive\\Desktop\\Project_fimalcomsic\\EncodeFile.p', 'rb') as file:
    ListKnownWithIds = pickle.load(file)
encodeListKnown, studentIds = ListKnownWithIds

# Initialize FaceChecker
face_checker = FaceCheckwahummanjinba("C:/Users/natna/OneDrive/Desktop/Project_fimalcomsic/model/l_version_1_300.pt")

# Initialize Variables
modeType = 0
counter = 0
id = -1
imgStudent = []
standings = []

# กำหนดค่า SECRET_KEY เพื่อใช้ในการตรวจสอบ JWT Token
SECRET_KEY = "API_KEY_2024"

def verify_jwt_token(token: str):
    try:
        # ตรวจสอบ token โดยใช้ secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload  # payload นี้สามารถนำไปใช้ต่อในการตรวจสอบสิทธิ์อื่น ๆ
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token หมดอายุแล้ว")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token ไม่ถูกต้อง")
    
def load_student_image(studentId, bucket):
    try:
        print(f"Student ID: {studentId}")


        studentInfo = db.reference(f'Students/{studentId}').get()
        if not studentInfo:
            return None, f"ไม่พบข้อมูลนักเรียนรหัส {studentId}"

        # โหลดไฟล์รูปภาพ
        blob = bucket.get_blob(f'{studentId}.jpg') or bucket.get_blob(f'{studentId}.png')
        print(f"Blob found: {blob}")
        if not blob:
            return None, f"ไม่พบรูปภาพสำหรับนักเรียนรหัส {studentId}"
        

        array = np.frombuffer(blob.download_as_string(), np.uint8)
        imgStudent = cv2.imdecode(array, cv2.IMREAD_COLOR)

        if imgStudent is None or imgStudent.size == 0:
            return None, f"ไม่สามารถถอดรหัสรูปภาพสำหรับนักเรียนรหัส {studentId}"

        if imgStudent.shape[:2] != (216, 216):
            return None, f"ขนาดรูปภาพไม่ถูกต้อง (ต้องการ 216x216) สำหรับนักเรียนรหัส {studentId}"

        return imgStudent, None
    except Exception as e:
        return None, f"เกิดข้อผิดพลาดในการโหลดรูปภาพ: {str(e)}"


def process_image_frame(img, classroomId,websocket):
    global imgBackground, modeType, counter, studentInfo, imgStudent
    imgBackground = np.copy(imgBackground)
    
    imgS = cv2.resize(img, (0, 0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)
    
    faceCurFrame = face_recognition.face_locations(imgS)
    encodeCurFrame = face_recognition.face_encodings(imgS, faceCurFrame)
    attendance_data = None
     
    imgBackground[162:162 + 480, 55:55 + 640] = img
    imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]

    if faceCurFrame:
        is_real = face_checker.check_face(imgBackground[162:162 + 480, 55:55 + 640])
        if is_real:
            for encodeFace, faceLoc in zip(encodeCurFrame, faceCurFrame):
                matches = face_recognition.compare_faces(encodeListKnown, encodeFace)
                faceDis = face_recognition.face_distance(encodeListKnown, encodeFace)
                matchIndex = np.argmin(faceDis)

                if matches[matchIndex]:
                    y1, x2, y2, x1 = faceLoc
                    y1, x2, y2, x1 = y1 * 4, x2 * 4, y2 * 4, x1 * 4
                    bbox = 55 + x1, 162 + y1, x2 - x1, y2 - y1
                    imgBackground = cvzone.cornerRect(imgBackground, bbox, rt=0)
                    studentId = studentIds[matchIndex]
                    websocket_data = None
                          # เรียกใช้ load_student_image และส่ง studentId เข้าไป
                    imgStudent, error_message = load_student_image(studentId, bucket)
                    if error_message:
                        print(error_message)
                        return imgBackground  # ออกหากเกิดข้อผิดพลาด
                    
                    if counter == 0:
                        cvzone.putTextRect(imgBackground, "Loading", (275, 300))
                        counter = 1
                        modeType = 1

            if counter != 0:
                if counter == 1:
                  # ดึงข้อมูลการเข้าเรียน
                 attendance_ref = db.reference(f'rooms/{classroomId}/members/{studentId}')
                 attendance_data = attendance_ref.get()
                 
                 studentInfo = db.reference(f'Students/{studentId}').get()
                #   # ดึงภาพนักศึกษา
                # imgStudent, error_message = load_student_image(studentId, bucket)
                # if error_message:
                #     print(error_message)
                #     return imgBackground  # ออกหากเกิดข้อผิดพลาด
                 
                 # รวมชื่อ-นามสกุล
                  # ตรวจสอบว่า attendance_data ไม่เป็น None และมีคีย์ 'fname' และ 'lname'
              # ตรวจสอบว่ามีข้อมูลการเช็กชื่อ
            if attendance_data is not None:
                # รวมชื่อและนามสกุล
                if 'fname' in attendance_data and 'lname' in attendance_data:
                    attendance_data['name-lastname'] = f"{attendance_data['fname']} {attendance_data['lname']}"
                else:
                    attendance_data['name-lastname'] = "ไม่พบข้อมูล"
                 
                # ตรวจสอบเวลาและอัพเดทสถานะ
                today = datetime.now().date()
                current_time = datetime.now()
        
                # ดึงเวลาเริ่ม-จบคาบเรียน
                start_time_str = attendance_data['startTime']
                end_time_str = attendance_data['endTime']
                startTime = datetime.combine(today, datetime.strptime(start_time_str, "%H:%M:%S").time())
                endTime = datetime.combine(today, datetime.strptime(end_time_str, "%H:%M:%S").time())
                time_diff = (current_time - startTime).total_seconds() / 60

                 # เช็คเวลาตั้งแต่การเช็คชื่อครั้งล่าสุด
                should_increment = True
                secondsElapsed = 0
                if 'last_attendance_time' in attendance_data:
                     datetimeObject = datetime.strptime(attendance_data['last_attendance_time'], 
                             "%Y-%m-%d %H:%M:%S")
                     secondsElapsed = (current_time - datetimeObject).total_seconds()
                     print(f"Seconds elapsed since last attendance: {secondsElapsed}")
              
                    # กำหนดสถานะการเข้าเรียน
                 
                if current_time >= endTime:           
                    standings = 'ขาดเรียน'
                elif time_diff < 0:
                    standings = 'ยังไม่ถึงเวลา'
                    should_increment = False
                elif time_diff <= 15:
                    standings = 'มาตรงเวลา'
                elif time_diff <= (endTime - startTime).total_seconds() / 60:
                    standings = 'มาสาย'
                else:
                    standings = 'ขาดเรียน'

                # เพิ่มการกำหนดค่าเริ่มต้นสำหรับ current_total_attendance
                current_total_attendance = attendance_data.get('total_attendance', 0)
                # ประกาศตัวแปรเพื่อติดตามการอัปเดตการเข้าเรียน
                if secondsElapsed > 30:  # ถ้าผ่านไป 30 วินาที   
                        # อัพเดทการเข้าเรียน
                 if should_increment:
                         current_total_attendance = attendance_data.get('total_attendance', 0) + 1
                         print(f"Incrementing attendance to: {current_total_attendance}")
                           
                                  
                         attendance_ref.update({
                        'total_attendance': current_total_attendance,
                        'last_attendance_time': current_time.strftime("%Y-%m-%d %H:%M:%S"),
                        'standing': standings
                        })

                    # ส่งข้อมูลการเข้าเรียนไปยัง WebSocket
                         websocket_data = {
                             'studentId': studentId,
                             'total_attendance': current_total_attendance,
                             'standing': standings,
                             'classroomId': classroomId,
                           
                         }
                         if websocket.client_state == WebSocketState.CONNECTED:
                            websocket.send(json.dumps(websocket_data))
                            print(f"Sent data to WebSocket: {websocket_data}")
                         else:
                            print("WebSocket is not connected.")
                
                
            else:
                
                    # ถ้าเพิ่งเช็คชื่อไป
                    modeType = 3
                    counter = 0
                    imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]
                    # cv2.imshow("Face Attendance", imgBackground)
                    cv2.waitKey(1)
                    return imgBackground
        else:
                # ดึงรูปภาพนักศึกษา
                
                blob = bucket.get_blob(f'{studentId}.jpg') or bucket.get_blob(f'{studentId}.png')
                if blob:
                    array = np.frombuffer(blob.download_as_string(), np.uint8)
                    imgStudent = cv2.imdecode(array, cv2.IMREAD_COLOR)
                    if imgStudent is None or imgStudent.size == 0:
                         print(f"Failed to decode image for student ID {studentId}")
                    elif imgStudent.shape[:2] != (216, 216):
                        imgStudent = cv2.resize(imgStudent, (216, 216))
                else:
                    print(f"No image found for student ID {studentId}")
                    imgStudent = None

            # แสดงผลข้อมูล
        if modeType != 3:
                if 10 < counter < 20:
                    modeType = 2

                imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]

                if counter <= 10:
                    # แสดงจำนวนครั้งที่เข้าเรียน
                    cv2.putText(imgBackground, str(attendance_data['total_attendance']), (861, 125),
                                cv2.FONT_HERSHEY_COMPLEX, 1, (255, 255, 255), 1)
                    # แสดงสาขา
                    cv2.putText(imgBackground, str(attendance_data.get('major', 'N/A')), (1006, 550),
                                cv2.FONT_HERSHEY_COMPLEX, 0.5, (255, 255, 255), 1)
                    # แสดงรหัสนักศึกษา
                    cv2.putText(imgBackground, str(studentId), (1006, 493),
                                cv2.FONT_HERSHEY_COMPLEX, 0.5, (255, 255, 255), 1)
                    # แสดงสถานะการเข้าเรียน
                    cv2.putText(imgBackground, str(attendance_data.get('standing', 'N/A')), (910, 625),
                                cv2.FONT_HERSHEY_COMPLEX, 0.6, (100, 100, 100), 1)

                    # แสดงชื่อ-นามสกุล
                    (w, h), _ = cv2.getTextSize(attendance_data['name-lastname'], cv2.FONT_HERSHEY_COMPLEX, 1, 1)
                    offset = (414 - w) // 2
                    cv2.putText(imgBackground, str(attendance_data['name-lastname']), (808 + offset, 445),
                                cv2.FONT_HERSHEY_COMPLEX, 1, (50, 50, 50), 1)

                    # แสดงรูปภาพ
                    if imgStudent is not None:
                        imgBackground[175:175 + 216, 909:909 + 216] = imgStudent

                counter += 1

                if counter >= 20:
                    counter = 0
                    modeType = 0
                    attendance_data = {}
                    imgStudent = None
                    imgBackground[44:44 + 633, 808:808 + 414] = imgModeList[modeType]
    else:
        modeType = 0
        counter = 0

    return imgBackground,websocket_data

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.websocket("/ws/{classroomId}")
async def websocket_endpoint(websocket: WebSocket, classroomId: str, token: str = Depends(verify_jwt_token)):
    await websocket.accept()
    cap = cv2.VideoCapture(0)
    

    retries = 5
    try:
        while retries > 0:
            try:
                if not cap.isOpened():
                    cap.open(0)

                while True:
                    if websocket.client is None:  # ตรวจสอบว่ายังเชื่อมต่ออยู่
                        print("WebSocket is closed, exiting loop.")
                        break
                    
                    success, img = cap.read()
                    if not success:
                        raise ValueError("Failed to read image from camera")

                    imgBackground, websocket_data = process_image_frame(img, classroomId, websocket)

                    # การส่งภาพ
                    _, img_encoded = cv2.imencode('.jpg', imgBackground)
                    img_base64 = base64.b64encode(img_encoded).decode('utf-8')
                    
                    # สร้างข้อมูลเพื่อส่ง
                    await websocket.send_text(img_base64)
                    # websocket_data['classroomId'] = classroomId

                    # ตรวจสอบว่าการเชื่อมต่อ WebSocket ยังอยู่
                    if websocket.client_state == WebSocketState.CONNECTED:
                        await websocket.send_text(json.dumps(websocket_data))
                        print(f"Sent data to WebSocket: {websocket_data}")
                    else:
                        print("WebSocket is not connected.")

                    await websocket.send_text(img_base64)
            except (ValueError, ConnectionResetError) as e:
                print(f"Error occurred: {e}. Retrying...")
                retries -= 1
                time.sleep(2)
                if retries == 0:
                    print("Failed to connect after several retries.")
                    await websocket.close()
            # except Exception as e:
            #     print(f"An unexpected error occurred: {e}")
            #     await websocket.close()
            #     break
    finally:
        cap.release()  # ปล่อยการเข้าถึงกล้องเมื่อเสร็จสิ้น
        # if websocket.client is not None:
        #     await websocket.close()  # ปิด WebSocket เมื่อเสร็จสิ้น

@app.get("/process", response_class=FileResponse)
async def process_image():
    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    success, img = cap.read()
    imgBackground = process_image_frame(img)

    output_path = "static/images/processed_image.png"
    cv2.imwrite(output_path, imgBackground)

    return output_path
