# Raspberry Pi ko'rsatma displeyi kioski

*[English](README.md)*

Raspberry Pi-ni maxsus, kuzatuvsiz ishlaydigan ekranga aylantiradi — u
`/instruction-display/:positionId` sahifasini butun ekranda ko'rsatadi va
uni doimiy ushlab turadi, qayta yuklanishlar, tarmoq uzilishlari yoki
brauzer ishdan chiqishlaridan keyin avtomatik qayta ulanadi.

## Sizga qaysi sozlash mos keladi

- **To'liq Raspberry Pi OS "Desktop" versiyasi (LXDE/PIXEL, taskbar bilan
  desktopga yuklanadi)** → quyidagi **A-variant**dan foydalaning. SD
  kartasi tayyor yozilgan holda kelgan aksariyat Pi-larda shu bo'ladi.
- **Raspberry Pi OS Lite (to'g'ridan-to'g'ri matnli konsolga yuklanadi,
  desktop yo'q)** → **B-variant**dan foydalaning.

Taxmin qilmang — Pi-ning o'zida tekshiring:

```bash
pgrep -a lightdm
```

Agar bu biror jarayonni chiqarsa, LightDM (displey menejeri) allaqachon
o'zining X sessiyasini ishga tushirgan → **A-variant**. Agar hech narsa
chiqmasa, siz Lite-dasiz → **B-variant**. Noto'g'ri variantni tanlash
ikkita X server bir xil displey uchun kurashishiga olib keladi va Chromium
umuman ko'rinmaydi (`systemctl status` xizmatni "active" deb ko'rsatadi,
lekin ekran qora bo'lib qoladi, uning ostida `Tasks: 0` ko'rinadi).

## Umumiy sozlash (ikkala variant uchun ham)

1. Pi-ni yuklang, tarmoqqa ulang va SSH orqali kiring (yoki
   klaviatura/monitordan foydalaning).

2. Kerakli paketlarni o'rnating:

   ```bash
   sudo apt update
   sudo apt install -y unclutter chromium-browser curl
   ```

   (Yangiroq Raspberry Pi OS versiyalarida paket `chromium-browser` emas,
   `chromium` deb nomlanadi — `apt` qaysi birini topsa, o'shani o'rnating;
   skript ikkalasini ham tekshiradi.)

3. Kiosk skriptini Pi-ga nusxalang:

   ```bash
   sudo cp instruction-kiosk.sh /usr/local/bin/instruction-kiosk.sh
   sudo chmod +x /usr/local/bin/instruction-kiosk.sh
   ```

Keyin Pi-ngizga mos keladigan variant bilan davom eting.

## A-variant — Desktop versiyasi (LightDM allaqachon ishlamoqda)

LightDM yuklanishda o'zining X serveri va sessiyasini ishga tushiradi.
Ikkinchisini ishga tushirishga urinish o'rniga, Chromium-ni o'sha
sessiyaning ICHIDA avtomatik ishga tushiring.

1. Desktop avtomatik kirish yoqilganligiga ishonch hosil qiling (odatda
   Desktop versiyasida bu standart bo'yicha yoqilgan):
   `sudo raspi-config` → System Options → Boot / Auto Login →
   **Desktop Autologin**.

2. Shu papkadagi `lxde-autostart.example` faylini joyiga nusxalang:

   ```bash
   mkdir -p ~/.config/lxsession/LXDE-pi
   cp lxde-autostart.example ~/.config/lxsession/LXDE-pi/autostart
   ```

   Bu desktop-ning standart avtoishga tushirish ro'yxatini faqat kiosk
   bilan almashtiradi — bu, qulay tomondan, taskbar va desktop
   belgilarini ham yashiradi, chunki boshqa hech narsa ishga tushishga
   sozlanmagan.

3. Qayta yuklang: `sudo reboot`.

## B-variant — Raspberry Pi OS Lite (desktop yo'q)

Displey menejeri ishlamayapti, shuning uchun oddiy X sessiyasi
to'g'ridan-to'g'ri systemd tomonidan ishga tushiriladi.

1. Service faylini nusxalang va konsolga avtomatik kirishni yoqing:

   ```bash
   sudo cp instruction-kiosk.service /etc/systemd/system/instruction-kiosk.service
   sudo raspi-config
   ```

   → System Options → Boot / Auto Login → **Console Autologin** (kerak,
   chunki service-ning tty-si kirish so'rovisiz mavjud bo'lishi kerak).

   Agar bu Pi-dagi foydalanuvchi hisobi `pi` bo'lmasa, avval
   `instruction-kiosk.service` faylidagi `User=`/`Group=` qatorlarini
   tahrirlang.

2. Yoqing va ishga tushiring:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable instruction-kiosk.service
   sudo systemctl start instruction-kiosk.service
   ```

## Har bir qurilma uchun sozlama

30 ta Pi orasida farq qiladigan yagona qadam shu, va u yuqoridagi ikkala
variant uchun ham amal qiladi. Birinchi yuklanishdan oldin (yoki keyin)
`/boot/instruction-display.conf` faylini tahrirlang (shu papkadagi
`instruction-display.conf.example` faylga qarang) va quyidagilarni
belgilang:

- `POSITION_ID` — bu Pi o'rnatilgan o'rin (admin panelidagi
  `/instruction-position` sahifasidan olingan `InstructionPosition` id
  qiymatiga mos kelishi kerak — buni o'sha yerdagi "Id" ustunidan o'qing,
  pozitsiyaning ko'rsatiladigan nomidan emas).
- `BASE_URL` — smt-ui ilovasi qayerda joylashtirilgan.

`/boot` oddiy FAT32 bo'lim bo'lgani uchun, bitta SD karta obrazini
yozib, uni barcha 30 ta Pi uchun klonlashingiz mumkin, so'ng har bir
kartadagi shu faylni oddiy kompyuter karta o'quvchisi orqali tahrirlang
— har bir Pi-ga alohida SSH orqali kirish shart emas.

Konfiguratsiyani tahrirlagandan so'ng, Pi-ni qayta yuklang (yoki, faqat
B-variant uchun, `sudo systemctl restart instruction-kiosk.service`
buyrug'ini ishga tushiring) — o'zgarish shu zahoti kuchga kiradi.

## Nima qiladi

- Brauzerni ishga tushirishdan oldin `BASE_URL` haqiqatan ham javob
  berishini kutadi, shunda tarmoq/server hali tayyor bo'lmay turib
  yuklangan Pi xato sahifasida qotib qolmaydi.
- Chromium-ni `--kiosk --incognito` rejimida ishga tushiradi — butun
  ekranda, manzil satrisiz, sessiya/ishdan chiqish tiklash so'rovlarisiz,
  qayta ishga tushirishlar orasida hech narsa saqlanmaydi.
- Ekran o'chishi/DPMS uyqu rejimini o'chiradi va sichqoncha kursorini
  yashiradi.
- Agar Chromium biror sababdan yopilsa (ishdan chiqish, xotira
  yetishmasligi, `chrome://` yangilanish eslatmasi va h.k.),
  `instruction-kiosk.sh` ichidagi tsikl uni 3 soniyadan keyin qayta
  ishga tushiradi.
- B-variantda, systemd service-dagi `Restart=always` tashqi holatni ham
  qamrab oladi — agar X sessiyasining o'zi to'xtab qolsa, systemd
  hammasini qayta ishga tushiradi.

## Tekshirish

A-variant:

```bash
ps aux | grep chromium   # --kiosk bilan ishlayotgan chromium jarayonini ko'rsatishi kerak
tail -f /tmp/instruction-kiosk.log   # faqat chromium qayta ishga tushganda yozuv paydo bo'ladi
```

B-variant:

```bash
sudo systemctl status instruction-kiosk.service
tail -f /tmp/instruction-kiosk.log
```

Displey sahifasining o'zi har 20 soniyada API-ni so'raydi, shuning
uchun liniyaning faol modelini almashtirish (`/line-active-model`
orqali) o'sha liniyadagi barcha Pi-larda ~20 soniya ichida, Pi
tomonidan hech qanday harakatsiz aks etishi kerak.
