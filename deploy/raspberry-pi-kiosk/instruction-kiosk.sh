#!/bin/bash
# Keeps a full-screen Chromium pointed at this Pi's instruction-display page,
# relaunching it if it ever exits or crashes. Reads POSITION_ID and BASE_URL
# from /boot/instruction-display.conf (see instruction-display.conf.example).
# Launched by instruction-kiosk.service as the kiosk X session.

set -u

CONF="/boot/instruction-display.conf"
[ -f "$CONF" ] || CONF="/boot/firmware/instruction-display.conf"

if [ ! -f "$CONF" ]; then
  echo "Missing config file: expected /boot/instruction-display.conf" >&2
  exit 1
fi

# shellcheck disable=SC1090
source "$CONF"

: "${POSITION_ID:?POSITION_ID not set in $CONF}"
: "${BASE_URL:?BASE_URL not set in $CONF}"

URL="${BASE_URL%/}/instruction-display/${POSITION_ID}"

# Never blank/sleep the screen; hide the mouse cursor once idle.
xset s off
xset s noblank
xset -dpms
unclutter -idle 0.5 -root &

CHROMIUM_BIN=$(command -v chromium-browser || command -v chromium)
if [ -z "${CHROMIUM_BIN:-}" ]; then
  echo "No chromium binary found (tried chromium-browser, chromium)" >&2
  exit 1
fi

echo "Waiting for $BASE_URL to respond..."
until curl -sf "$BASE_URL" -o /dev/null --max-time 3; do
  sleep 2
done

while true; do
  "$CHROMIUM_BIN" \
    --kiosk \
    --incognito \
    --noerrdialogs \
    --disable-infobars \
    --disable-session-crashed-bubble \
    --disable-translate \
    --no-first-run \
    --overscroll-history-navigation=0 \
    --check-for-update-interval=31536000 \
    --autoplay-policy=no-user-gesture-required \
    "$URL"

  echo "$(date): chromium exited, restarting in 3s..." >> /tmp/instruction-kiosk.log
  sleep 3
done
