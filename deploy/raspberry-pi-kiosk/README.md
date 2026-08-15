# Raspberry Pi instruction display kiosk

Turns a Raspberry Pi into a dedicated, unattended screen that shows the
`/instruction-display/:positionId` page full-screen and keeps it there,
reconnecting automatically after reboots, network drops, or browser crashes.

## One-time setup per Pi

Flash **Raspberry Pi OS Lite** (32-bit or 64-bit) to the SD card — no desktop
environment needed, this runs its own minimal X session.

1. Boot the Pi, connect it to the network, and SSH in (or use a keyboard/monitor).

2. Install dependencies:

   ```bash
   sudo apt update
   sudo apt install -y xserver-xorg xinit x11-xserver-utils unclutter chromium-browser curl
   ```

   (On newer Raspberry Pi OS releases the package is named `chromium` instead
   of `chromium-browser` — install whichever `apt` finds; the script checks
   for both.)

3. Copy the script and service file onto the Pi:

   ```bash
   sudo cp instruction-kiosk.sh /usr/local/bin/instruction-kiosk.sh
   sudo chmod +x /usr/local/bin/instruction-kiosk.sh
   sudo cp instruction-kiosk.service /etc/systemd/system/instruction-kiosk.service
   ```

   If this Pi's user account isn't `pi`, edit `User=`/`Group=` in
   `instruction-kiosk.service` first.

4. Enable and start it:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable instruction-kiosk.service
   sudo systemctl start instruction-kiosk.service
   ```

5. Set up automatic login to a console session on boot (required so the
   service's X session can start without a login prompt sitting in the way):

   ```bash
   sudo raspi-config
   ```

   → System Options → Boot / Auto Login → **Console Autologin**.

## Per-device configuration

This is the only step that differs between the 30 Pis. Before (or after)
first boot, edit `/boot/instruction-display.conf` (see
`instruction-display.conf.example` in this folder) to set:

- `POSITION_ID` — which seat this Pi is mounted at (matches an
  `InstructionPosition` id from `/instruction-position` in the admin UI).
- `BASE_URL` — where the smt-ui app is hosted.

Because `/boot` is a plain FAT32 partition, you can flash one SD card image,
clone it for all 30 Pis, and edit only this one file per card from a normal
PC card reader — no need to SSH into each Pi individually.

After editing the config, reboot the Pi (or run
`sudo systemctl restart instruction-kiosk.service`) to pick it up.

## What it does

- Waits for `BASE_URL` to actually respond before launching the browser, so a
  Pi that boots before the network/server is ready doesn't get stuck on an
  error page.
- Runs Chromium in `--kiosk --incognito` mode — full-screen, no address bar,
  no session/crash-restore prompts, nothing persisted between restarts.
- Disables screen blanking/DPMS sleep and hides the mouse cursor.
- If Chromium ever exits (crash, OOM, `chrome://` update nag, whatever), the
  loop in `instruction-kiosk.sh` relaunches it after 3 seconds.
- `Restart=always` on the systemd service covers the outer case — if the X
  session itself dies, systemd restarts the whole thing.

## Verifying

```bash
sudo systemctl status instruction-kiosk.service
tail -f /tmp/instruction-kiosk.log   # only has entries if chromium restarted
```

The display page itself polls the API every 20 seconds, so switching a
line's active model (via `/line-active-model`) should be reflected on every
Pi at that line within ~20 seconds, with no Pi-side action needed.
