// 验证 trigger menu 的材质层能被 MENU_GLASS_LAYER 匹配到。
const { JSDOM } = require('C:/Users/11251/node_modules/jsdom')

const dom = new JSDOM(`<!doctype html><html><body>
  <div data-composer-card id="composer">
    <div data-composer-overlay>
      <div class="menu" data-trigger-menu id="trigger-menu">
        <div data-menu-material="translucent" data-menu-phase="enter" id="surface">
          <div aria-hidden="true" id="material"></div>
          <div role="listbox"><button role="menuitem">a</button></div>
        </div>
      </div>
    </div>
  </div>
  <!-- 普通菜单（portal 到 body） -->
  <div data-menu-material="translucent" data-menu-phase="enter" id="surface2">
    <div aria-hidden="true" id="material2"></div>
    <div role="menu"></div>
  </div>
</body></html>`)
const d = dom.window.document

const MENU_GLASS_LAYER = '[data-menu-material] > [aria-hidden="true"]:first-child'
const ids = [...d.querySelectorAll(MENU_GLASS_LAYER)].map(n => n.id)
console.log('MENU_GLASS_LAYER ->', JSON.stringify(ids))
console.log('trigger material matched:', ids.includes('material') ? 'PASS' : 'FAIL')
console.log('normal menu material matched:', ids.includes('material2') ? 'PASS' : 'FAIL')

// composer card 是否是 trigger 材质的祖先
const m = d.getElementById('material')
console.log('material.closest(composer-card):', m.closest('[data-composer-card]')?.id ?? '(none)')

// 解除滤镜的规则必须命中（深层 :has，菜单与 card 之间隔着 overlay 层）
const relax = '[data-composer-card]:has([data-trigger-menu])'
const relaxed = [...d.querySelectorAll(relax)].map(n => n.id)
console.log('relax rule hits:', JSON.stringify(relaxed),
  relaxed.includes('composer') ? 'PASS' : 'FAIL')

process.exit(ids.includes('material') && ids.includes('material2') && relaxed.includes('composer') ? 0 : 1)
