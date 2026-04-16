# 📱 Nouveau™ WhatsApp Setup Guide

## Step 1 — Twilio Account Banao (FREE)

1. Go to: https://www.twilio.com/try-twilio
2. Sign up with your email
3. Phone verify karo
4. Dashboard pe jaao

## Step 2 — Credentials Copy Karo

Dashboard pe dikhega:
```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token:  xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
Dono copy karo.

## Step 3 — .env File Update Karo

backend/.env mein yeh lines update karo:
```
TWILIO_ACCOUNT_SID=AC...apna real SID...
TWILIO_AUTH_TOKEN=...apna real token...
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

## Step 4 — WhatsApp Sandbox Join Karo

1. Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Ek code dikhega jaise: "join silver-lake"
3. Apne phone se WhatsApp kholo
4. +1 415 523 8886 pe yeh message bhejo: join silver-lake
5. Confirmation aayega ✅

## Step 5 — Test Karo

Backend chalu hone ke baad:
- Admin panel → koi order kholo
- WhatsApp test bhej ke dekho

## Step 6 — Webhook Set Karo (Production ke liye)

Twilio Console → WhatsApp Sandbox Settings:
```
Webhook URL: https://your-backend.render.com/api/whatsapp/webhook
Method: HTTP POST
```

## Automatic Messages:

| Event | Customer ko message |
|-------|-------------------|
| Order place | ✅ Order confirmation + items |
| Payment done | ✅ Payment receipt |  
| Admin → Shipped | ✅ Shipping update + tracking link |
| Admin → Out for Delivery | ✅ Alert |
| Admin → Delivered | ✅ Delivered confirmation |

## Customer Bot Commands:

Customer WhatsApp pe type kare:
- `HI` → Welcome menu
- `ORDER` → Track order
- `ORD1748xxxxxxx` → Direct order status
- `PAYMENT` → Payment info
- `SUPPORT` → Help
