const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Domino Visual & Flow Audit', () => {
  test.beforeEach(async ({ page }) => {
    const filePath = path.resolve('index.html');
    await page.goto('file://' + filePath);
  });

  test('Deve iniciar modo offline e verificar layout das maos', async ({ page }) => {
    // 1. Iniciar modo Offline
    await page.click('button:has-text("Um Jogador")');

    // 2. Selecionar Dificuldade
    await page.click('#btn-normal');

    // 3. Selecionar Meta e Iniciar (Meta 3 Vitorias)
    // Usando seletor mais específico para evitar ambiguidade com o '3' do nível difícil
    await page.click('button[onclick="selectGoal(3)"]');

    // 4. Verificar se a mensagem de "BUSCANDO" sumiu e o jogo comecou
    const status = page.locator('#game-status');
    await expect(status).not.toHaveText(/BUSCANDO/i, { timeout: 10000 });

    // 5. Validar Layout das Maos (Paralelismo)
    const hand0 = page.locator('#hand-0 .tiles-rack');
    await expect(hand0).toBeVisible();
    
    // Pequeno delay para garantir que o flexbox terminou de assentar
    await page.waitForTimeout(500);
    
    const box0 = await hand0.boundingBox();
    console.log('Rack Height (Player):', box0.height);
    
    // Altura esperada para uma linha: ~60-90px dependendo da escala
    expect(box0.height).toBeLessThan(110);

    // 6. Verificar visibilidade dos oponentes (7 pecas)
    const hand1 = page.locator('#hand-1 .tile');
    await expect(hand1).toHaveCount(7);
    
    const hand2 = page.locator('#hand-2 .tile');
    await expect(hand2).toHaveCount(7);

    // Screenshot final
    await page.screenshot({ path: 'tests/audit_result.png', fullPage: true });
  });
});
