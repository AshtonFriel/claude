# INK-ZERO GP 🏁🦑⚡

A retro pseudo-3D racing game blending **Mario Kart**, **Splatoon**, and **F-Zero** —
all in a single dependency-free HTML file.

**Play it:** just open `index.html` in any browser.

## The blend

| From | You get |
|---|---|
| Splatoon | Shoot ink to paint the track. Your ink makes you faster, enemy ink slows you to a crawl. Ink tank refills fastest on your own turf. A turf-share meter and a Turf Champion crowned at the finish. |
| Mario Kart | 4-racer grand prix, drifting with chargeable mini-turbos, projectiles that spin out rivals, item pickups, rubber-band AI, off-track rescue. |
| F-Zero | Mode-7 style rendered circuit, boost energy meter (partially refilled each lap), chevron boost pads, machines that read 900+ km/h. |

## Controls

| Key | Action |
|---|---|
| `↑` / `W` | Accelerate |
| `↓` / `S` | Brake / reverse |
| `←` `→` / `A` `D` | Steer |
| `Shift` | Drift (hold ~1s / ~2s while turning, release for mini-turbo) |
| `Space` | Fire ink (paints track, splats rivals) |
| `X` / `Ctrl` | Boost (drains energy meter) |
| `M` | Mute |
| `Enter` | Start / rematch |

## Tips

- Paint the racing line on lap 1 — it pays off every lap after.
- Boosting sprays ink under you: boost = paint = permanent speed lane.
- Boost pads recharge energy; golden rings refill both ink and boost.
- Winning the race and winning the turf war are separate honors. Do both.

## Tech notes

- No dependencies, no build. One HTML file, ~480×270 internal resolution, upscaled with pixelated rendering.
- The ground is a 2048² world texture sampled per-pixel each frame with the classic Mode-7 perspective transform (per-scanline distance + fog).
- Ink is painted into a separate layer clipped to a road mask, rebaked into the sampler texture per dirty-rect, and mirrored into a 256² ownership grid that drives the speed-on-turf logic and turf percentages.
- Sound is a tiny WebAudio synth (engine hum tracks your speed).
