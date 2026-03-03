// ═══════════════════════════════════════════════════════
//  Pixel Seongsu Adventure  –  game.js
// ═══════════════════════════════════════════════════════

// ── 1. 엔진 초기화 ──
kaplay({
  width: 800,
  height: 480,
  crisp: true,
  letterbox: true,
  background: [42, 46, 68],
})

setGravity(0)

// ── 2. 에셋 로딩 ──
// 주인공 스프라이트시트 (4x4)
loadSprite("player_char", "/assets/player_spritesheet.png", {
  sliceX: 4,
  sliceY: 4,
  anims: {
    "walk-left":  { from: 0, to: 3, speed: 8, loop: true },
    "walk-left2": { from: 4, to: 7, speed: 8, loop: true },
    "walk-right": { from: 8, to: 11, speed: 8, loop: true },
    "walk-right2":{ from: 12, to: 15, speed: 8, loop: true },
    "idle-left":  { from: 0, to: 0 },
    "idle-right": { from: 8, to: 8 },
  }
})

// 배경
loadSprite("bg_city", "/assets/final_back.jpg")
loadSprite("graffiti_wall", "/assets/graffiti_wall.png")
loadSprite("road", "/assets/road.png")

// 건물들
loadSprite("building_dior",        "/assets/building_dior.png")
loadSprite("building_onion",       "/assets/building_onion.png")
loadSprite("building_tamburins",   "/assets/building_tamburins.png")
loadSprite("building_musinsa",     "/assets/building_musinsa.png")
loadSprite("building_blueelephant","/assets/building_blueelephant.png")
loadSprite("building_covernat",    "/assets/building_covernat.png")
loadSprite("building_pointofview", "/assets/building_pointofview.png")
loadSprite("building_nyunyu",      "/assets/building_nyunyu.png")
loadSprite("building_matinkim",    "/assets/building_matinkim.png")
loadSprite("building_adererror",   "/assets/building_adererror.png")
loadSprite("building_popup1",      "/assets/building_popup1.png")
loadSprite("building_popup2",      "/assets/building_popup2.png")
loadSprite("building_photoism",    "/assets/building_photoism.png")
loadSprite("building_zenmon",      "/assets/building_zenmon.png")
loadSprite("building_zenmon_popup","/assets/building_zenmon_popup.png")
loadSprite("building_random1",     "/assets/building_random1.png")
loadSprite("building_random2",     "/assets/building_random2.png")
loadSprite("building_random3",     "/assets/building_random3.png")
loadSprite("building_random4",     "/assets/building_random4.png")
loadSprite("building_random5",     "/assets/building_random5.png")
loadSprite("building_random6",     "/assets/building_random6.png")
loadSprite("building_random7",     "/assets/building_random7.png")

// NPC (캐릭터 시트를 슬라이싱해서 첫 프레임만 사용)
loadSprite("npc_hoodie_boy",    "/assets/npc_hoodie_boy.png",    { sliceX: 5, sliceY: 2 })
loadSprite("npc_phone_girl",    "/assets/npc_phone_girl.png",    { sliceX: 4, sliceY: 2 })
loadSprite("npc_headphone_girl","/assets/npc_headphone_girl.png",{ sliceX: 3, sliceY: 2 })
loadSprite("npc_colorful_boy",  "/assets/npc_colorful_boy.png",  { sliceX: 2, sliceY: 1 })
loadSprite("npc_walking_boy",   "/assets/npc_walking_boy.png",   { sliceX: 3, sliceY: 2 })
loadSprite("npc_pink_girl",     "/assets/npc_pink_girl.png",     { sliceX: 3, sliceY: 1 })
loadSprite("npc_denim_boy",     "/assets/npc_denim_boy.png",     { sliceX: 2, sliceY: 1 })

// 포장마차
loadSprite("food_cart", "/assets/food_cart.png")

// 거리 소품
loadSprite("street_props", "/assets/street_props.png")

console.log("[ENGINE] 에셋 로딩 요청 완료")

// ── 3. 전역 상태 ──
let currentSceneId = 0
let gameState = {
  player_name: "플레이어",
  player_x: -1,
  energy: 100,
  gold: 0,
  inventory: [],
  discovered_events: [],
}

// ── 4. 타이틀 화면 (캔버스 위 오버레이) ──
const titleScreen = document.getElementById("title-screen")
const hudEl = document.getElementById("hud")
const invBtn = document.getElementById("inventory-btn")
const mobileControls = document.getElementById("mobile-controls")

let gameStarted = false
function startGame() {
  if (gameStarted) return
  gameStarted = true
  titleScreen.style.display = "none"
  hudEl.style.display = "flex"
  invBtn.style.display = "block"
  if ("ontouchstart" in window) {
    mobileControls.style.display = "flex"
  }
  go("main")
}
titleScreen.addEventListener("click", startGame)
titleScreen.addEventListener("touchstart", (e) => { e.preventDefault(); startGame() })

// ── 5. 인벤토리 시스템 ──
const invPanel = document.getElementById("inventory-panel")
const invGrid = document.getElementById("inventory-grid")
const invDesc = document.getElementById("inventory-desc")
const invCloseBtn = document.getElementById("inventory-close")
let inventoryOpen = false

const ITEM_DB = {
  coffee:    { icon: "\u2615", name: "성수 핸드드립 커피", desc: "어니언에서 만든 스페셜티 커피.\n에너지 +20 회복.", energy: 20 },
  fishcake:  { icon: "\uD83C\uDF62", name: "포장마차 어묵", desc: "따끈한 어묵 한 꼬치.\n에너지 +15 회복.", energy: 15 },
  taiyaki:   { icon: "\uD83D\uDC1F", name: "붕어빵", desc: "겨울철 인기 간식 붕어빵.\n에너지 +10 회복.", energy: 10 },
  tote_bag:  { icon: "\uD83D\uDC5C", name: "무신사 에코백", desc: "무신사 스탠다드에서 받은 에코백.\n성수 패션의 상징!", energy: 0 },
  perfume:   { icon: "\uD83E\uDDF4", name: "탬버린즈 향수 샘플", desc: "탬버린즈에서 받은 향수 샘플.\n은은한 우디향이 난다.", energy: 0 },
  photocard: { icon: "\uD83D\uDCF8", name: "포토이즘 사진", desc: "포토이즘에서 찍은 인생네컷.\n추억이 담겨있다!", energy: 0 },
  book:      { icon: "\uD83D\uDCD6", name: "포인트오브뷰 독립서적", desc: "성수동 독립서점의 추천 책.\n읽으면 세상이 달라 보인다.", energy: 0 },
  sticker:   { icon: "\u2B50", name: "팝업스토어 스티커", desc: "한정판 팝업스토어 스티커.\n컬렉터 아이템!", energy: 0 },
}

function renderInventory() {
  invGrid.innerHTML = ""
  for (let i = 0; i < 8; i++) {
    const slot = document.createElement("div")
    slot.className = "inv-slot"
    const itemKey = gameState.inventory[i]
    if (itemKey && ITEM_DB[itemKey]) {
      slot.textContent = ITEM_DB[itemKey].icon
      slot.addEventListener("click", () => {
        document.querySelectorAll(".inv-slot").forEach(s => s.classList.remove("active"))
        slot.classList.add("active")
        const item = ITEM_DB[itemKey]
        let desc = `${item.name}\n${item.desc}`
        if (item.energy > 0) desc += `\n\n[클릭하여 사용 - 에너지 +${item.energy}]`
        invDesc.textContent = desc
      })
      slot.addEventListener("dblclick", () => {
        const item = ITEM_DB[itemKey]
        if (item.energy > 0) {
          gameState.energy = Math.min(100, gameState.energy + item.energy)
          gameState.inventory.splice(i, 1)
          updateHUD()
          renderInventory()
          invDesc.textContent = `${item.name}을(를) 사용했다! 에너지 +${item.energy}`
        }
      })
    }
    invGrid.appendChild(slot)
  }
  invDesc.textContent = "아이템을 클릭하면 상세정보를, 더블클릭하면 사용합니다."
}

invBtn.addEventListener("click", () => {
  inventoryOpen = !inventoryOpen
  invPanel.style.display = inventoryOpen ? "block" : "none"
  if (inventoryOpen) {
    renderInventory()
    // scene("main") 내부가 아닐 경우 fadeBgm이 정의되지 않았을 수 있으므로 체크
    if (typeof fadeBgm === "function") fadeBgm(0.01, 500)
  } else {
    if (typeof fadeBgm === "function") fadeBgm(0.3, 800)
  }
})
invCloseBtn.addEventListener("click", () => {
  inventoryOpen = false
  invPanel.style.display = "none"
  if (typeof fadeBgm === "function") fadeBgm(0.3, 800)
})

// ── HUD 업데이트 ──
function updateHUD() {
  document.getElementById("hud-energy-fill").style.width = `${gameState.energy}%`
  document.getElementById("hud-energy-text").textContent = gameState.energy
  document.getElementById("hud-gold-text").textContent = gameState.gold
}

// ── 6. 네트워크 유틸 ──
const getControllers = {}
function abortGetRequests() {
  Object.keys(getControllers).forEach(key => {
    getControllers[key]?.abort()
    delete getControllers[key]
  })
}
async function safeGet(key, url) {
  getControllers[key]?.abort()
  const controller = new AbortController()
  getControllers[key] = controller
  try {
    const res = await fetch(url, { signal: controller.signal })
    return await res.json()
  } catch (e) {
    if (e.name === "AbortError") return null
    throw e
  } finally {
    if (getControllers[key] === controller) delete getControllers[key]
  }
}

const postLocks = {}
function resetLocks() { Object.keys(postLocks).forEach(k => postLocks[k] = false) }
async function lockCall(key, fn) {
  if (postLocks[key]) return
  postLocks[key] = true
  try { return await fn() } finally { postLocks[key] = false }
}

// ═══════════════════════════════════════════════════════
//  7. 메인 게임 씬
// ═══════════════════════════════════════════════════════
scene("main", () => {
  const mySceneId = ++currentSceneId
  abortGetRequests()
  resetLocks()

  // ── 맵 상수 (작업서 참고: 배경540, 캐릭터180, 건물400) ──
  const GROUND_Y = 455            // 바닥 Y좌표 (배경 이미지의 인도 위치에 맞춤)
  const MAP_WIDTH = 8000          // 전체 맵 너비 (건물 간격 절반 압축)
  const PLAYER_SCALE = 0.75
  const SPEED = 180
  const BG_HEIGHT = 480

  // ── 대화 상태 ──
  let isDialogOpen = false
  let isTyping = false
  let isAdvancing = false
  let dialogLines = []
  let dialogIndex = 0
  let loopCtrl = null
  let currentNPCPortrait = ""

  // ── BGM 설정 ──
  const bgm = new Audio('/assets/main_bgm1.mp3')
  bgm.loop = true
  bgm.volume = 0.3
  bgm.play().catch(() => {
    document.addEventListener('click', () => bgm.play(), { once: true })
  })

  // ── NPC 대화 효과음 ──
  const sfxDialog = new Audio('/assets/npc_sound.mp3')
  sfxDialog.volume = 0.6

  // ── BGM 페이드 함수 ──
  function fadeBgm(targetVolume, duration) {
    const step = (targetVolume - bgm.volume) / (duration / 50)
    const interval = setInterval(() => {
      const next = bgm.volume + step
      if ((step > 0 && next >= targetVolume) || (step < 0 && next <= targetVolume)) {
        bgm.volume = targetVolume
        clearInterval(interval)
      } else {
        bgm.volume = Math.max(0, Math.min(1, next))
      }
    }, 50)
  }

  const dialogBox = document.getElementById("dialog-box")
  const dialogName = document.getElementById("dialog-name")
  const dialogText = document.getElementById("dialog-text")
  const dialogPortrait = document.getElementById("dialog-portrait")
  const dialogActionBtns = document.getElementById("dialog-action-btns")
  const dialogBtnIn = document.getElementById("dialog-btn-in")
  const dialogBtnOut = document.getElementById("dialog-btn-out")
  const exitModal = document.getElementById("exit-modal")
  const exitModalConfirm = document.getElementById("exit-modal-confirm")
  const exitModalCancel = document.getElementById("exit-modal-cancel")

  function openExitModal() {
    exitModal.style.display = "flex"
    fadeBgm(0.01, 500)
  }

  function closeExitModal() {
    exitModal.style.display = "none"
    fadeBgm(0.3, 800)
  }

  exitModalConfirm.addEventListener("click", () => {
    window.location.href = "/"
  })

  exitModalCancel.addEventListener("click", () => {
    closeExitModal()
  })

  document.getElementById("exit-modal-overlay").addEventListener("click", () => {
    closeExitModal()
  })

  const shopModal = document.getElementById("shop-modal")
  const shopModalName = document.getElementById("shop-modal-name")
  const shopModalImg = document.getElementById("shop-modal-img")
  const shopModalDesc = document.getElementById("shop-modal-desc")
  const shopModalLink = document.getElementById("shop-modal-link")
  const shopModalClose = document.getElementById("shop-modal-close")
  let currentNPCModal = null
  let currentNPCIsExit = false

  function openShopModal(modalData) {
    if (!modalData) return
    shopModalName.textContent = modalData.name
    shopModalImg.src = modalData.image
    shopModalDesc.textContent = modalData.desc
    shopModalLink.href = modalData.link
    shopModal.style.display = "flex"
    fadeBgm(0.01, 500)
  }

  function closeShopModal() {
    shopModal.style.display = "none"
    fadeBgm(0.3, 800)
  }

  shopModalClose.addEventListener("click", closeShopModal)
  document.getElementById("shop-modal-overlay").addEventListener("click", closeShopModal)

  // ── 배경 (패럴랙스) ──
  // final_back.jpg = 1024x254, 화면 높이에 맞춰 스케일
  const BG_SCALE_Y = BG_HEIGHT / 254
  const BG_TILE_W = 1024 * BG_SCALE_Y
  const BG_TILES = Math.ceil(MAP_WIDTH / BG_TILE_W) + 2
  for (let i = 0; i < BG_TILES; i++) {
    const bx = i * BG_TILE_W
    add([
      sprite("bg_city"),
      pos(bx, 0),
      anchor("topleft"),
      scale(BG_SCALE_Y),
      z(-100),
      "bg_far",
    ])
  }

  // 도로 타일 제거 - final_back.jpg 배경에 인도가 포함되어 있음

  // ── 건물 배치 데이터 (최종 반영 좌표) ──
  // x: 시작 위치, s: 스케일 (이미지 너비 1024px 기준 대략적인 맞춤)
  const BUILDINGS = [
    { spr: "building_random1",      x: 7600,  y: 10, s: 0.30 }, // 1. 도입부 A
    { spr: "building_random2",      x: 7900,  y: 20, s: 0.25 }, // 2. 도입부 B
    { spr: "building_popup1",       x: 850,  y: -30, s: 0.35 }, // 3. 팝업존 ①
    { spr: "building_random3",      x: 2150, y: 0, s: 0.30 }, // 4. 팝업존 ①
    { spr: "building_random4",      x: 5650, y: -10, s: 0.30 }, // 5. 팝업존 ①
    { spr: "building_musinsa",      x: 1800, y: 0, s: 0.40 }, // 6. 의류존 (무탠다드)
    { spr: "building_covernat",     x: 150, y: 10, s: 0.40 }, // 7. 의류존 (커버낫)
    { spr: "building_matinkim",     x: 2550, y: 10, s: 0.20 }, // 8. 의류존 (마뗑킴)
    { spr: "building_adererror",    x: 6500, y: 40, s: 0.25 }, // 9. 의류존 (아더에러)
    { spr: "building_zenmon",       x: 3425, y: -20, s: 0.55 }, // 10. 랜드마크 (젠몬사옥)
    { spr: "building_dior",         x: 1325, y: 60, s: 0.50 }, // 11. 랜드마크 (디올성수)
    { spr: "building_tamburins",    x: 4250, y: 60, s: 0.35 }, // 12. 향수/뷰티 (탬버린즈)
    { spr: "building_blueelephant", x: 4650, y: 30, s: 0.30 }, // 13. 선글라스 (블루엘리펀트)
    { spr: "building_photoism",     x: 5000, y: 10, s: 0.30 }, // 14. 포토존 (포토이즘)
    { spr: "building_onion",        x: 5325, y: 0, s: 0.35 }, // 15. 카페존 (어니언)
    { spr: "building_zenmon_popup", x: 6000, y: 30, s: 0.35 }, // 16. 젠몬팝업
    { spr: "food_cart",             x: 3900, y: 0, s: 0.10 }, // 17. 포장마차
    { spr: "building_pointofview",  x: 3000, y: -20, s: 0.30 }, // 18. 잡화존 (포인트오브뷰)
    { spr: "building_nyunyu",       x: 6950, y: -5, s: 0.30 }, // 19. 잡화존 (뉴뉴)
    { spr: "building_random5",      x: 7300, y: -5, s: 0.30 }, // 20. 후반부 E
    { spr: "building_random6",      x: 450, y: 25, s: 0.30 }, // 21. 후반부 F
    { spr: "building_random7",      x: 3705, y: 0, s: 0.30 }, // 22. 맵 엔딩 G
  ]

  BUILDINGS.forEach(b => {
    add([
      sprite(b.spr),
      pos(b.x, GROUND_Y + (b.y || 0)),
      anchor("bot"),
      scale(b.s),
      z(-10),
      "building",
    ])
  })

  // ── 기존 포장마차 개별 배치 로직 삭제 (BUILDINGS에 통합됨) ──

  // ── NPC 데이터 & 배치 ──
  // 슬라이싱 후 프레임 크기 참고:
  // hoodie_boy:    205x512   → s=0.20 → ~41x102px
  // phone_girl:    256x512   → s=0.20 → ~51x102px
  // headphone_girl:341x512   → s=0.20 → ~68x102px
  // colorful_boy:  512x1024  → s=0.10 → ~51x102px
  // walking_boy:   341x512   → s=0.20 → ~68x102px
  // pink_girl:     341x1024  → s=0.10 → ~34x102px
  // denim_boy:     512x1024  → s=0.10 → ~51x102px
  const NPCS = [
    {
      id: "npc_onion_barista",
      name: "어니언 바리스타",
      spriteKey: "npc_headphone_girl",
      x: 5475, npcScale: 0.25,
      portrait: "/assets/npc_headphone_girl.png",
      modal: { name: "어니언 성수", image: "/assets/building_onion.png", desc: "성수동 대표 카페. 공장을 개조한 독특한 인테리어.", link: "https://www.instagram.com/onion.seongsu" },
      lines: [
        "어서오세요, 어니언에 오신 걸 환영해요!",
        "이 건물은 원래 공장이었는데,\n지금은 카페로 변했답니다.",
        "핸드드립 커피 한 잔 드릴게요!",
      ],
      revisit_lines: [
        "또 오셨네요! 오늘의 원두는 에티오피아산이에요.",
        "여유롭게 즐기다 가세요!",
      ],
      reward: { item: "coffee", gold: 0 },
    },
    {
      id: "npc_dior_staff",
      name: "디올 성수 스태프",
      spriteKey: "npc_pink_girl",
      x: 1275, npcScale: 0.13,
      portrait: "/assets/npc_pink_girl.png",
      modal: { name: "디올 성수", image: "/assets/building_dior.png", desc: "디올의 성수동 플래그십 스토어. 화려한 외관이 인상적.", link: "https://www.dior.com" },
      lines: [
        "디올 성수에 오신 걸 환영합니다.",
        "이 건물은 디올이 성수동에 만든\n특별한 플래그십 스토어예요.",
        "전시도 구경하고 가세요!",
      ],
      revisit_lines: [
        "오늘은 새로운 전시가 시작됐어요!",
        "사진 찍기 좋은 포토존도 있답니다.",
      ],
      reward: { item: null, gold: 10 },
    },
    {
      id: "npc_tamburins_guide",
      name: "탬버린즈 안내원",
      spriteKey: "npc_phone_girl",
      x: 4375, npcScale: 0.32,
      portrait: "/assets/npc_phone_girl.png",
      modal: { name: "탬버린즈", image: "/assets/building_tamburins.png", desc: "젠틀몬스터 그룹의 향수 브랜드. 독창적인 향수 라인업.", link: "https://www.tamburins.com" },
      lines: [
        "탬버린즈에 오신 걸 환영해요!",
        "젠틀몬스터 그룹의 향수 브랜드예요.",
        "이 향수 샘플 하나 가져가세요!",
      ],
      revisit_lines: [
        "향수 마음에 드셨어요?",
        "새로운 라인도 나왔으니 구경해 보세요!",
      ],
      reward: { item: "perfume", gold: 0 },
    },
    {
      id: "npc_musinsa_staff",
      name: "무신사 스탠다드 직원",
      spriteKey: "npc_hoodie_boy",
      x: 1950, npcScale: 0.35,
      portrait: "/assets/npc_hoodie_boy.png",
      modal: { name: "무신사 스탠다드 성수", image: "/assets/building_musinsa.png", desc: "무신사의 오프라인 플래그십 스토어.", link: "https://store.musinsa.com" },
      lines: [
        "무신사 스탠다드 성수에 오신 걸 환영합니다!",
        "요즘 베이직 무지 티가 제일 잘 나가요.",
        "에코백 하나 드릴게요, 쇼핑할 때 쓰세요!",
      ],
      revisit_lines: [
        "오~ 에코백 잘 쓰고 계시네요!",
        "신상 후드도 나왔으니 구경해 보세요.",
      ],
      reward: { item: "tote_bag", gold: 0 },
    },
    {
      id: "npc_food_cart_vendor",
      name: "포장마차 아주머니",
      spriteKey: null,
      x: 3900, npcScale: 0,
      portrait: "/assets/food_cart.png",
      modal: null,
      lines: [
        "어머~ 학생! 추운데 어묵 한 꼬치 먹고 가!",
        "붕어빵도 막 구웠어, 따끈따끈해!",
        "여기 어묵이랑 붕어빵 하나씩!",
      ],
      revisit_lines: [
        "또 왔구나! 오늘은 떡볶이도 있어~",
        "많이 먹어! 덤으로 더 줄게!",
      ],
      reward: { item: "fishcake", gold: 0 },
    },
    {
      id: "npc_blueelephant_artist",
      name: "블루엘리펀트 아티스트",
      spriteKey: "npc_colorful_boy",
      x: 4725, npcScale: 0.12,
      portrait: "/assets/npc_colorful_boy.png",
      modal: { name: "블루엘리펀트", image: "/assets/building_blueelephant.png", desc: "성수동 복합문화공간. 전시와 공연이 열리는 곳.", link: "https://www.instagram.com/blueelephant_seoul" },
      lines: [
        "여기는 블루엘리펀트, 복합문화공간이야!",
        "전시도 하고, 공연도 하고...\n성수동의 예술 심장 같은 곳이지.",
        "오늘 전시 꼭 보고 가!",
      ],
      revisit_lines: [
        "이번 달 새 전시 시작했어!",
        "매번 올 때마다 다른 작품을 볼 수 있지.",
      ],
      reward: { item: null, gold: 15 },
    },
    {
      id: "npc_covernat_designer",
      name: "커버낫 디자이너",
      spriteKey: "npc_denim_boy",
      x: 300, npcScale: 0.15,
      portrait: "/assets/npc_denim_boy.png",
      modal: { name: "커버낫 성수", image: "/assets/building_covernat.png", desc: "스트릿 캐주얼 브랜드 커버낫의 성수 플래그십.", link: "https://covernat.net" },
      lines: [
        "커버낫 성수 플래그십에 온 걸 환영해!",
        "성수동하면 스트릿 패션이지.",
        "이번 시즌 컬렉션 한번 봐봐!",
      ],
      revisit_lines: [
        "스타일 좋은데? 우리 옷이 잘 어울릴 듯!",
        "콜라보 아이템도 나왔으니 확인해 봐!",
      ],
      reward: { item: null, gold: 10 },
    },
    {
      id: "npc_pointofview_owner",
      name: "포인트오브뷰 서점 주인",
      spriteKey: "npc_walking_boy",
      x: 3150, npcScale: 0.26,
      portrait: "/assets/npc_walking_boy.png",
      modal: { name: "포인트오브뷰", image: "/assets/building_pointofview.png", desc: "성수동의 독립서점. 감성적인 독립출판물이 가득.", link: "https://www.instagram.com/point.of.view.seoul" },
      lines: [
        "포인트오브뷰에 오신 걸 환영합니다.",
        "여기는 성수동의 독립서점이에요.",
        "이 책 한 권 추천드릴게요!",
      ],
      revisit_lines: [
        "다 읽으셨어요? 소감이 궁금하네요.",
        "새로 들어온 책들도 있으니 구경해 보세요.",
      ],
      reward: { item: "book", gold: 0 },
    },
    {
      id: "npc_matinkim_fan",
      name: "마뗑킴 매니아",
      spriteKey: "npc_pink_girl",
      x: 2650, npcScale: 0.12,
      portrait: "/assets/npc_pink_girl.png",
      modal: { name: "마뗑킴", image: "/assets/building_matinkim.png", desc: "감각적인 여성 패션 브랜드 마뗑킴의 성수 매장.", link: "https://www.matinkim.com" },
      lines: [
        "마뗑킴! 요즘 제일 핫한 브랜드잖아!",
        "성수에 오프라인 매장이 있다니...\n직접 와봐야 느낌이 달라!",
        "이 가방 너무 예쁘지 않아?!",
      ],
      revisit_lines: [
        "나 결국 가방 샀어... 후회 없음!",
        "너도 하나 질러봐!",
      ],
      reward: { item: null, gold: 20 },
    },
    {
      id: "npc_adererror_hipster",
      name: "아더에러 패피",
      spriteKey: "npc_colorful_boy",
      x: 6475, npcScale: 0.12,
      portrait: "/assets/npc_colorful_boy.png",
      modal: { name: "아더에러", image: "/assets/building_adererror.png", desc: "성수동 본사를 둔 감성 스트릿 브랜드.", link: "https://adererror.com" },
      lines: [
        "아더에러 성수 본사 앞이야.",
        "이 벽돌 건물 분위기 미쳤지?",
        "에러에서 영감을 얻는 브랜드라니, 쿨하지 않아?",
      ],
      revisit_lines: [
        "오늘도 OOTD 찍으러 왔어!",
        "성수는 매일 와도 사진 찍을 게 넘쳐.",
      ],
      reward: { item: null, gold: 10 },
    },
    {
      id: "npc_popup_explorer",
      name: "팝업 탐험가",
      spriteKey: "npc_hoodie_boy",
      x: 900, npcScale: 0.35,
      portrait: "/assets/npc_hoodie_boy.png",
      modal: { name: "팝업스토어존", image: "/assets/building_popup1.png", desc: "성수동 팝업스토어 거리. 매주 새로운 브랜드가 찾아온다.", link: "https://www.instagram.com/explore/tags/성수팝업" },
      lines: [
        "여기 팝업스토어 봤어?!",
        "성수동은 매주 새로운 팝업이 열려서\n올 때마다 다른 거 볼 수 있어!",
        "이 스티커 줄게, 기념으로 가져가!",
      ],
      revisit_lines: [
        "이번 주 팝업은 더 대박이야!",
        "한정판 굿즈 남았으니 빨리 가봐!",
      ],
      reward: { item: "sticker", gold: 0 },
    },
    {
      id: "npc_photoism_staff",
      name: "포토이즘 직원",
      spriteKey: "npc_phone_girl",
      x: 5000, npcScale: 0.30,
      portrait: "/assets/npc_phone_girl.png",
      modal: { name: "포토이즘", image: "/assets/building_photoism.png", desc: "인생네컷 포토부스. 다양한 테마의 사진을 남길 수 있다.", link: "https://photoism.co.kr" },
      lines: [
        "포토이즘에 오신 걸 환영해요!",
        "인생네컷 한 장 찍어 가세요~",
        "자, 여기 사진이요! 잘 나왔네요!",
      ],
      revisit_lines: [
        "또 찍으러 오셨어요? 오늘은 새 프레임이 있어요!",
        "사진은 추억이니까요!",
      ],
      reward: { item: "photocard", gold: 0 },
    },
    {
      id: "npc_exit",
      name: "성수동 안내원",
      spriteKey: "npc_phone_girl",
      x: 7850,
      npcScale: 0.32,
      portrait: null,
      modal: null,
      isExit: true,
      lines: [
        "성수동 탐험을 마치셨군요!",
        "오늘 하루도 성수동을 즐겨주셔서 감사해요 🙏",
        "웹페이지로 돌아가시겠어요?"
      ],
      reward: null
    },
  ]

  // NPC 오브젝트 배치
  NPCS.forEach(npc => {
    // 대화 트리거 영역
    add([
      rect(140, 200),
      pos(npc.x, GROUND_Y),
      area(),
      anchor("bot"),
      opacity(0),
      z(-1),
      "npc_trigger",
      { npcData: npc },
    ])

    // NPC 스프라이트 (포장마차 NPC는 카트 자체가 비주얼)
    if (npc.spriteKey) {
      add([
        sprite(npc.spriteKey, { frame: 0 }),    // 첫 프레임만 표시
        pos(npc.x, GROUND_Y),
        anchor("bot"),
        scale(npc.npcScale),
        z(5),
        "npc_sprite",
        { npcId: npc.id },
      ])
    }

    // 말풍선 노란 박스 배경
    const bubbleY = GROUND_Y - 210
    add([
      rect(20, 26, { radius: 3 }),
      pos(npc.x, bubbleY),
      anchor("center"),
      color(255, 220, 0),
      z(14),
      "npc_bubble_bg",
    ])
    // 말풍선 느낌표 (검정)
    add([
      text("!", { size: 20 }),
      pos(npc.x, bubbleY),
      anchor("center"),
      color(0, 0, 0),
      z(15),
      "npc_bubble",
      { npcId: npc.id, baseY: bubbleY, t: Math.random() * Math.PI * 2 },
    ])
  })

  // 말풍선 애니메이션
  onUpdate("npc_bubble", (bubble) => {
    bubble.t += dt() * 2.5
    bubble.pos.y = bubble.baseY + Math.sin(bubble.t) * 5
  })

  // ── 플레이어 생성 ──
  const initX = gameState.player_x >= 0 ? gameState.player_x : 150
  const player = add([
    sprite("player_char", { anim: "idle-right" }),
    scale(PLAYER_SCALE),
    pos(Math.max(30, Math.min(initX, MAP_WIDTH - 30)), GROUND_Y),
    anchor("bot"),
    area(),
    z(10),
    "player",
  ])

  // ── 카메라 ──
  const CAM_Y = GROUND_Y - height() * 0.35
  function clampCamX(px) {
    if (MAP_WIDTH <= width()) return MAP_WIDTH / 2
    return Math.max(width() / 2, Math.min(px, MAP_WIDTH - width() / 2))
  }
  camPos(vec2(clampCamX(player.pos.x), CAM_Y))

  // ── 패럴랙스 업데이트 ──
  function updateParallax() {
    // 패럴랙스 비활성화 - 배경이 건물과 동일 속도로 이동
  }

  // ── 이동 & 애니메이션 ──
  let facingRight = true
  let mobileDir = 0

  // 모바일 버튼
  const btnLeft = document.getElementById("btn-left")
  const btnRight = document.getElementById("btn-right")
  const btnAction = document.getElementById("btn-action")

  if (btnLeft) {
    btnLeft.addEventListener("touchstart", (e) => { e.preventDefault(); mobileDir = -1 })
    btnLeft.addEventListener("touchend", () => mobileDir = 0)
    btnRight.addEventListener("touchstart", (e) => { e.preventDefault(); mobileDir = 1 })
    btnRight.addEventListener("touchend", () => mobileDir = 0)
    btnAction.addEventListener("touchstart", (e) => {
      e.preventDefault()
      if (isDialogOpen) advanceDialog()
      else triggerNearestNPC()
    })
  }

  onUpdate(() => {
    if (inventoryOpen) return
    if (isDialogOpen) { return }

    let dir = mobileDir
    if (isKeyDown("left") || isKeyDown("a")) dir = -1
    if (isKeyDown("right") || isKeyDown("d")) dir = 1

    if (dir !== 0) {
      player.move(dir * SPEED, 0)
      player.pos.x = Math.max(30, Math.min(player.pos.x, MAP_WIDTH - 30))
    }

    // 애니메이션
    if (dir < 0) {
      facingRight = false
      if (player.curAnim() !== "walk-left") player.play("walk-left")
    } else if (dir > 0) {
      facingRight = true
      if (player.curAnim() !== "walk-right") player.play("walk-right")
    } else {
      const cur = player.curAnim()
      if (cur && cur.startsWith("walk")) {
        player.play(facingRight ? "idle-right" : "idle-left")
      }
    }

    // 카메라 따라가기
    camPos(vec2(clampCamX(player.pos.x), CAM_Y))
    gameState.player_x = Math.floor(player.pos.x)

    updateParallax()
  })

  // ── 타자기 효과 ──
  function startTypewriter(txt, onComplete) {
    if (loopCtrl) { loopCtrl.cancel(); loopCtrl = null }
    dialogText.textContent = ""
    isTyping = true
    isAdvancing = false
    let i = 0
    loopCtrl = loop(0.04, () => {
      if (currentSceneId !== mySceneId) { loopCtrl.cancel(); loopCtrl = null; return }
      dialogText.textContent += txt[i]
      i++
      if (i >= txt.length) {
        loopCtrl.cancel(); loopCtrl = null
        isTyping = false
        isAdvancing = false
        onComplete?.()
      }
    })
  }

  // ── 대화창 ──
  function openDialog(npcName, lines, portrait, modalData, isExit) {
    isDialogOpen = true
    sfxDialog.currentTime = 0
    sfxDialog.play()
    fadeBgm(0.01, 500)
    isAdvancing = false
    dialogLines = lines
    dialogIndex = 0
    currentNPCPortrait = portrait || ""
    currentNPCModal = modalData || null
    currentNPCIsExit = isExit || false
    dialogActionBtns.style.display = "none"

    dialogBox.classList.add("open")
    dialogBox.style.display = "flex"
    dialogName.textContent = npcName

    if (currentNPCPortrait) {
      dialogPortrait.src = currentNPCPortrait
      dialogPortrait.style.display = "block"
    } else {
      dialogPortrait.style.display = "none"
    }

    startTypewriter(dialogLines[dialogIndex], null)
  }

  function closeDialog(skipBgm = false) {
    if (loopCtrl) { loopCtrl.cancel(); loopCtrl = null }
    isDialogOpen = false
    isTyping = false
    isAdvancing = false
    dialogLines = []
    dialogIndex = 0
    dialogBox.classList.remove("open")
    dialogBox.style.display = "none"
    dialogText.textContent = ""
    dialogName.textContent = ""
    dialogActionBtns.style.display = "none"
    if (!skipBgm) fadeBgm(0.3, 800)
  }

  function advanceDialog() {
    if (!isDialogOpen) return
    if (isAdvancing) return
    isAdvancing = true

    if (isTyping) {
      isAdvancing = false
      if (loopCtrl) { loopCtrl.cancel(); loopCtrl = null }
      isTyping = false
      dialogText.textContent = dialogLines[dialogIndex]
      return
    }

    dialogIndex++
    if (dialogIndex >= dialogLines.length) {
      if (currentNPCIsExit) {
        closeDialog(true)
        openExitModal()
      } else if (currentNPCModal) {
        dialogActionBtns.style.display = "flex"
        dialogBtnIn.onclick = () => {
          closeDialog(true)
          openShopModal(currentNPCModal)
        }
        dialogBtnOut.onclick = () => {
          closeDialog()
        }
      } else {
        closeDialog()
      }
    } else {
      startTypewriter(dialogLines[dialogIndex], null)
    }
  }

  // ── NPC 상호작용 ──
  function triggerNearestNPC() {
    if (isDialogOpen) return

    const triggers = get("npc_trigger")
    let nearestNPC = null
    let nearestDist = 100

    for (const t of triggers) {
      const dist = Math.abs(player.pos.x - t.pos.x)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestNPC = t.npcData
      }
    }
    if (!nearestNPC) return

    const isRevisit = gameState.discovered_events.includes(nearestNPC.id)
    const lines = (isRevisit && nearestNPC.revisit_lines)
      ? nearestNPC.revisit_lines
      : nearestNPC.lines

    if (!isRevisit) {
      gameState.discovered_events.push(nearestNPC.id)

      // 보상 지급
      if (nearestNPC.reward) {
        if (nearestNPC.reward.item && gameState.inventory.length < 8) {
          gameState.inventory.push(nearestNPC.reward.item)
        }
        if (nearestNPC.reward.gold) {
          gameState.gold += nearestNPC.reward.gold
        }
        // 에너지 소모 (탐험 비용)
        gameState.energy = Math.max(0, gameState.energy - 5)
        updateHUD()
      }

      // 자동저장
      lockCall("autoSave", async () => {
        try {
          const res = await fetch("/api/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(gameState),
          })
          if (res.ok) console.log("[자동저장 완료]")
        } catch (e) { console.error("[자동저장 실패]", e) }
      })
    }

    openDialog(nearestNPC.name, lines, nearestNPC.portrait, nearestNPC.modal, nearestNPC.isExit)
  }

  // ── 키 입력 ──
  onKeyPress("space", () => {
    if (inventoryOpen) return
    if (isDialogOpen) { advanceDialog(); return }
    triggerNearestNPC()
  })

  onKeyPress("up", () => {
    if (isDialogOpen && currentNPCModal && dialogActionBtns.style.display !== "none") {
      closeDialog(true)
      openShopModal(currentNPCModal)
    }
  })

  onKeyPress("down", () => {
    if (isDialogOpen && dialogActionBtns.style.display !== "none") {
      closeDialog()
    }
  })

  onKeyPress("e", () => {
    if (isDialogOpen) return
    inventoryOpen = !inventoryOpen
    invPanel.style.display = inventoryOpen ? "block" : "none"
    if (inventoryOpen) {
      renderInventory()
      fadeBgm(0.01, 500)
    } else {
      fadeBgm(0.3, 800)
    }
  })

  // HUD 초기화
  updateHUD()

  console.log("[ENGINE] 메인 씬 초기화 완료 - 맵 너비:", MAP_WIDTH)
})

// ═══════════════════════════════════════════════════════
//  8. 엔진 시작
// ═══════════════════════════════════════════════════════
onLoad(() => {
  console.log("[ENGINE] 모든 에셋 로딩 완료, 타이틀 화면 대기 중")
})
