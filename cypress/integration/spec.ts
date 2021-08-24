describe('Welcome Page', () => {
  it('Changes language', () => {
    cy.visit('/')
    cy.contains('Willkommen bei Zivilschutz-Karte!')
    cy.get('app-session-creator img.flag:nth-child(2)').click()
    cy.contains('Bienvenue à Zivilschutz-Karte!')
    cy.get('app-session-creator img.flag:last-child').click()
    cy.contains('Welcome to Zivilschutz-Karte!')
  })
})
