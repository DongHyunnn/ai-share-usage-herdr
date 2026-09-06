# AI Share Usage — herdr plugin

Several people, one Codex (ChatGPT) account. This plugin puts everyone's share
of this week's quota in the herdr sidebar, live: `48% / 61%` means the account
is 61% used and your 1/N share is 48% used.

Codex only reports usage for the whole account, never per person. Each member's
client uploads its own per-model token counts to a Supabase project the team
owns, next to account snapshots; comparing the percent gained between two
snapshots with the tokens logged in between gives each person's share.

## Install

```sh
herdr plugin install DongHyunnn/ai-share-usage-herdr
```

Then, in any pane:

```sh
ais join <invite>
```

`<invite>` is the one-line invite your team admin sends you — it carries the
server address and the public key, so there is nothing else to configure. The
`Join with invite` popup asks for it interactively if you prefer.

## What you get

- **Sidebar token `$ais`** — your share, the account, and a pace marker
  (`~48% / 61% ⚡1.3×`). The `~` means the model weights are still seeds; it
  disappears once the team has 6 observations. A trailing `!` means you or the
  account crossed a threshold.
- **Popup panes** — `Usage dashboard` (the full-screen dashboard), `Join with
  invite`, `Show invite`, `Sign in with GitHub`, `Sign out`.
- **Action `Refresh usage`** — runs one collect-and-upload cycle now.
- **`ais open`** — the same dashboard in a browser tab, served by the daemon on
  `127.0.0.1`. Handy on a machine where the popup pane is too small, or when
  someone else on the team has no herdr at all.
- **Notifications** — a warning at 80% of your share, alarms at 100% of your
  share and 90% of the account, once per weekly window.

The startup hook spawns a detached `ais daemon` that keeps collecting while
herdr runs; it skips the spawn when one is already working. State lives in
`$HERDR_PLUGIN_STATE_DIR/ais` (`settings.json`, `session.json`, `cursors.json`,
`alerts.json`, `daemon.json`, `daemon.log`), never in the plugin checkout.

## Without herdr

The same bundle is a normal CLI:

```sh
npm i -g github:DongHyunnn/ai-share-usage-herdr
ais join <invite>
ais daemon &
ais status
ais dashboard
```

There is also a VS Code extension, *AI Share Usage*, on the Marketplace and
Open VSX. All three surfaces share one core, so the numbers never disagree.

## Privacy

Model names, token counts, session ids, message timestamps and the machine
hostname go to your team's server. Prompts, responses, file names and file
contents never do, and your Codex access token never leaves your machine.

This repository contains **no server coordinates**: no project URL, no key.
The invite token your admin hands you carries them, which is also why an invite
belongs in a team channel and nowhere else.

## Troubleshooting

- **No number in the sidebar** — the daemon is not running. Run
  `ais daemon --once` in a pane, then check
  `$HERDR_PLUGIN_STATE_DIR/ais/daemon.json` and `daemon.log`.
- **The sidebar and the CLI disagree** — run `ais herdr status-line`; it prints
  exactly what the sidebar should show.
- **`not signed in`** — open the `Sign in with GitHub` popup.

MIT licensed.

---

# AI Share Usage — herdr 플러그인 (한국어)

Codex(ChatGPT) 계정 하나를 여러 명이 함께 쓸 때, 이번 주 할당량을 각자 얼마나
썼는지 herdr 사이드바에 실시간으로 보여 줍니다. `48% / 61%`는 계정 전체가 61%
찼고, 내 1/N 몫은 48%를 썼다는 뜻입니다.

## 설치

```sh
herdr plugin install DongHyunnn/ai-share-usage-herdr
```

설치한 뒤 아무 페인에서 관리자에게 받은 초대 코드로 `ais join <invite>`를
실행하세요. 초대 코드 한 줄에 서버 주소와 공개 키가 들어 있어 따로 설정할 것이
없습니다. `초대 코드로 참여` 팝업에서 붙여넣어도 됩니다.

## 무엇이 보이나요

- **사이드바 `$ais`** — 내 몫, 계정 사용률, 속도 표시(`~48% / 61% ⚡1.3×`).
  `~`는 아직 관측이 6개 미만이라 시드 가중치로 계산했다는 뜻이고, 뒤에 붙는
  `!`는 임계값을 넘었다는 표시입니다.
- **팝업 페인** — `사용량 대시보드`, `초대 코드로 참여`, `초대 코드 보기`,
  `GitHub 로그인`, `로그아웃`.
- **액션 `사용량 새로고침`** — 수집과 업로드를 한 바퀴 즉시 실행합니다.
- **알림** — 내 몫 80%에서 경고, 내 몫 100%와 계정 90%에서 알람이 뜹니다.
  주간 창마다 한 번씩입니다.

시작 훅이 `ais daemon`을 백그라운드로 띄우고, 이미 돌고 있으면 다시 띄우지
않습니다. 상태 파일은 `$HERDR_PLUGIN_STATE_DIR/ais`에 저장되며 플러그인
디렉터리에는 아무것도 쓰지 않습니다.

## herdr 없이 쓰기

```sh
npm i -g github:DongHyunnn/ai-share-usage-herdr
ais join <invite>
```

VS Code용 *AI Share Usage* 확장도 있습니다. 세 가지 모두 같은 코어를 쓰기
때문에 숫자가 서로 어긋나지 않습니다.

## 개인정보

모델 이름과 토큰 수, 세션 식별자, 메시지 시각, 컴퓨터 이름만 팀 서버로
올라갑니다. 프롬프트와 응답, 파일 이름과 내용은 올라가지 않고, Codex 액세스
토큰은 이 컴퓨터를 벗어나지 않습니다.

이 저장소에는 서버 주소도 키도 들어 있지 않습니다. 그 값은 초대 코드 안에
있으므로, 초대 코드는 팀 채널 밖으로 내보내지 마세요.

## 문제 해결

- **사이드바에 숫자가 안 뜹니다** — 데몬이 시작되지 않은 경우입니다. 페인에서
  `ais daemon --once`를 실행하고 `$HERDR_PLUGIN_STATE_DIR/ais/daemon.json`을
  확인하세요.
- **사이드바와 CLI 값이 다릅니다** — `ais herdr status-line`이 사이드바에 떠야
  할 값을 그대로 출력합니다.
