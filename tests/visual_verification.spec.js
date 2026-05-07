const { test, expect } = require('@playwright/test');

test('visual test: tile sizes and camera scaling', async ({ page }) => {
  // Aumenta o timeout para instalação de browsers se necessário
  test.setTimeout(120000);

  await page.goto('http://localhost:8080');
  
  // 1. Seleciona "Um Jogador"
  await page.click('text=Um Jogador');
  
  // 2. Seleciona "Normal"
  await page.click('text=Normal');
  
  // 3. Seleciona "Meta: 3 Vitorias"
  await page.click('text=Meta: 3 Vitorias');
  
  // Espera a tela de jogo carregar (o board-container deve estar visível)
  await page.waitForSelector('#board-container', { state: 'visible' });
  
  // Espera um pouco para as peças serem distribuídas e a primeira peça jogada
  await page.waitForTimeout(2000);

  // Tira um screenshot do jogo
  await page.screenshot({ path: 'visual_test_desktop.png' });
  
  // Verifica as dimensões das peças no CSS (via variáveis do documento)
  const tileWidth = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--tile-width').trim());
  const tileHeight = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--tile-height').trim());
  
  console.log(`Verificação de CSS: --tile-width=${tileWidth}, --tile-height=${tileHeight}`);
  
  expect(tileWidth).toBe('40px');
  expect(tileHeight).toBe('80px');

  // Verifica se o snake element existe e tem transform aplicado
  const snakeTransform = await page.evaluate(() => {
    const el = document.getElementById('snake');
    return el ? el.style.transform : 'null';
  });
  console.log(`Snake Transform: ${snakeTransform}`);

  // Teste mobile
  await page.setViewportSize({ width: 375, height: 667 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'visual_test_mobile.png' });
});
