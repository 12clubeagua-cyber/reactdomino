const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Domino Multiplayer E2E Audit', () => {
  test('Deve criar sala (Host) e simular inicio de partida', async ({ browser }) => {
    const filePath = 'file://' + path.resolve('index.html');

    // 1. Setup do HOST
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    await hostPage.goto(filePath);

    // Host clica em "Criar Sala" (texto exato do span/button)
    await hostPage.click('button:has-text("Criar Sala")');
    
    // Seleciona Dificuldade (Normal)
    await hostPage.click('#btn-normal');
    
    // Seleciona Meta (Meta: 3 Vitorias)
    await hostPage.click('button:has-text("Meta: 3 Vitorias")');

    // Screenshot do Lobby do Host aguardando
    await hostPage.screenshot({ path: 'tests/multiplayer_host_lobby.png' });
    
    // Verifica se o codigo da sala aparece
    const codeDisplay = hostPage.locator('#host-code-display');
    await expect(codeDisplay).toBeVisible();

    // 2. Setup do CLIENTE (Simulando entrada na tela de conexao)
    const clientContext = await browser.newContext();
    const clientPage = await clientContext.newPage();
    await clientPage.goto(filePath);

    await clientPage.click('button:has-text("Entrar na Sala")');
    await expect(clientPage.locator('#join-code-input')).toBeVisible();
    await clientPage.screenshot({ path: 'tests/multiplayer_client_join.png' });

    // 3. Forcar inicio no Host
    await hostPage.evaluate(() => {
        const btn = document.getElementById('btn-start-multi');
        if (btn) btn.style.display = 'block';
    });
    await hostPage.click('#btn-start-multi');

    // Verifica transicao para o jogo
    const hostStatus = hostPage.locator('#game-status');
    await expect(hostStatus).not.toHaveText(/DOMINO MASTER/i, { timeout: 10000 });
    
    await hostPage.screenshot({ path: 'tests/multiplayer_final.png' });
  });
});
