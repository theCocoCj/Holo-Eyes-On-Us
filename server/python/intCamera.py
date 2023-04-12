import os
import asyncio
import time

PIEDE_SX, PIEDE_DX = [29, 31], [30, 32]
OCCHI = [n + 1 for n in range(6)]
MANO_SX, MANO_DX = [17, 19, 21], [18, 20, 22]
FOLLOW_POSITION = '106'

content = ''

try:
    from websockets.sync.client import connect
except ModuleNotFoundError:
    os.system('pip install websockets')
    from websockets.sync.client import connect
try:
    import cv2
except ModuleNotFoundError:
    os.system('pip install opencv-python')
    import cv2
try:
    import mediapipe as mp
except ModuleNotFoundError:
    os.system('pip install mediapipe')
    import mediapipe as mp

def sendPositions():
    try:
        with connect("ws://severino.t47.it:3000") as websocket:
            websocket.send(FOLLOW_POSITION + '_' + content)
    except:
        pass


mpDraw = mp.solutions.drawing_utils
mpPose = mp.solutions.pose
pose = mpPose.Pose()

cap = cv2.VideoCapture(0)
pTime = 0

while True:
    success, img = cap.read()
    imgRGB = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    results = pose.process(imgRGB)

    if results.pose_landmarks:
        mpDraw.draw_landmarks(img, results.pose_landmarks, mpPose.POSE_CONNECTIONS)
        content = ''
        for id, lm in enumerate(results.pose_landmarks.landmark):
            h, w, c = img.shape
            # print(id, lm)
            cx, cy = int(lm.x * w), int(lm.y * h)
            content = content + str(lm) + '\n'

            if id in PIEDE_DX + MANO_DX:
                cv2.circle(img, (cx, cy), 5, (255, 255, 255), cv2.FILLED)
            elif id in PIEDE_SX + MANO_SX:
                cv2.circle(img, (cx, cy), 5, (0, 255, 0), cv2.FILLED)
            elif id in OCCHI:
                cv2.circle(img, (cx, cy), 5, (0, 0, 0), cv2.FILLED)
            else:
                cv2.circle(img, (cx, cy), 5, (255, 0, 0), cv2.FILLED)

        sendPositions()

    time.sleep(0.001)  # per dare tempo al server di leggere
    cTime = time.time()
    fps = 1 / (cTime - pTime)
    pTime = cTime

    cv2.putText(img, str(int(fps)), (70, 50), cv2.FONT_HERSHEY_PLAIN, 3, (255, 0, 0), 3)
    # cv2.imshow("Image", img)
    cv2.waitKey(1)
