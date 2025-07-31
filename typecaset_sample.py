curl 'https://typecast.ai/api/speak' \
  -H 'accept: application/json, text/plain, */*' \
  -H 'accept-language: ko,en;q=0.9' \
  -H 'authorization: Bearer __pltTMazPRLuEVrxNUEQQAiMMt6rhzzMontSSENuQU6Z' \
  -H 'content-type: application/json' \
  -H 'dnt: 1' \
  -H 'origin: https://biz.typecast.ai' \
  -H 'priority: u=1, i' \
  -H 'referer: https://biz.typecast.ai/' \
  -H 'sec-ch-ua: "Not)A;Brand";v="8", "Chromium";v="138"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'sec-ch-ua-platform: "macOS"' \
  -H 'sec-fetch-dest: empty' \
  -H 'sec-fetch-mode: cors' \
  -H 'sec-fetch-site: same-site' \
  -H 'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36' \
  --data-raw '{"actor_id":"622964d6255364be41659078","text":"안녕하세요","lang":"auto","model_version":"latest","xapi_hd":true,"tempo":1,"volume":100,"pitch":0,"xapi_audio_format":"wav","emotion_tone_preset":"normal-1"}'


"""
 지원되는 emotion_tone_preset 리스트
    
 - normal-1
 - happay-1
 - sad-1
 - angry-1
"""

