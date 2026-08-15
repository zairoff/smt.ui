# Raspberry Pi instruction display kiosk

*[O'zbekcha](README.uz.md)*

Turns a Raspberry Pi into a dedicated, unattended screen that shows the
`/instruction-display/:positionId` page full-screen and keeps it there,
reconnecting automatically after reboots, network drops, or browser crashes.

## Which setup applies to you

- **Full Raspberry Pi OS "Desktop" image (LXDE/PIXEL, boots to a desktop
  with a taskbar)** → use **Option A** below. This is what most Pis shipped
  with an SD card already imaged will be running.
- **Raspberry Pi OS Lite (boots straight to a text console, no desktop)** →
  use **Option B**.

Don't guess — check on the Pi itself:

```bash
pgrep -a lightdm
```

If that prints a process, LightDM (a display manager) is already running
its own X session → **Option A**. If it prints nothing, you're on Lite →
**Option B**. Using the wrong option means two X servers fight over the
display and Chromium never actually shows up (service looks "active" in
`systemctl status` but the display stays black, with `Tasks: 0` under it).

## Common setup (both options)

1. Boot the Pi, connect it to the network, and SSH in (or use a keyboard/monitor).

2. Install dependencies:

   ```bash
   sudo apt update
   sudo apt install -y unclutter chromium-browser curl
   ```

   (On newer Raspberry Pi OS releases the package is named `chromium`
   instead of `chromium-browser` — install whichever `apt` finds; the
   script checks for both.)

3. Copy the kiosk script onto the Pi:

   ```bash
   sudo cp instruction-kiosk.sh /usr/local/bin/instruction-kiosk.sh
   sudo chmod +x /usr/local/bin/instruction-kiosk.sh
   ```

Then continue with whichever option matches your Pi.

## Option A — Desktop image (LightDM already running)

LightDM already starts its own X server and session on boot. Autostart
Chromium *inside* that session rather than trying to start a second one.

1. Make sure Desktop Autologin is enabled (it usually is by default on the
   Desktop image): `sudo raspi-config` → System Options → Boot / Auto Login
   → **Desktop Autologin**.

2. Copy `lxde-autostart.example` from this folder into place:

   ```bash
   mkdir -p ~/.config/lxsession/LXDE-pi
   cp lxde-autostart.example ~/.config/lxsession/LXDE-pi/autostart
   ```

   This replaces the desktop's default autostart list with just the kiosk
   — which also conveniently hides the taskbar and desktop icons, since
   nothing else is set to launch.

3. Reboot: `sudo reboot`.

## Option B — Raspberry Pi OS Lite (no desktop)

No display manager is running, so a bare X session is started directly by
systemd.

1. Copy the service file and enable console auto-login:

   ```bash
   sudo cp instruction-kiosk.service /etc/systemd/system/instruction-kiosk.service
   sudo raspi-config
   ```

   → System Options → Boot / Auto Login → **Console Autologin** (required
   so the service's tty is available without a login prompt sitting in the
   way).

   If this Pi's user account isn't `pi`, edit `User=`/`Group=` in
   `instruction-kiosk.service` first.

2. Enable and start it:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable instruction-kiosk.service
   sudo systemctl start instruction-kiosk.service
   ```

## Per-device configuration

This is the only step that differs between the 30 Pis, and applies to both
options above. Before (or after) first boot, edit
`/boot/instruction-display.conf` (see `instruction-display.conf.example` in
this folder) to set:

- `POSITION_ID` — which seat this Pi is mounted at (matches an
  `InstructionPosition` id from `/instruction-position` in the admin UI —
  read it off the "Id" column there, not the position's display name).
- `BASE_URL` — where the smt-ui app is hosted.

Because `/boot` is a plain FAT32 partition, you can flash one SD card image,
clone it for all 30 Pis, and edit only this one file per card from a normal
PC card reader — no need to SSH into each Pi individually.

After editing the config, reboot the Pi (or, on Option B only, run
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
- On Option B, `Restart=always` on the systemd service covers the outer
  case too — if the X session itself dies, systemd restarts the whole thing.

## Verifying

Option A:

```bash
ps aux | grep chromium   # should show a --kiosk chromium process
tail -f /tmp/instruction-kiosk.log   # only has entries if chromium restarted
```

Option B:

```bash
sudo systemctl status instruction-kiosk.service
tail -f /tmp/instruction-kiosk.log
```

The display page itself polls the API every 20 seconds, so switching a
line's active model (via `/line-active-model`) should be reflected on every
Pi at that line within ~20 seconds, with no Pi-side action needed.
