describe('Welcome Page', () => {
  it('Changes language', () => {
    cy.visit('/')
    cy.contains('Willkommen bei ZSKarte 2!')
    cy.get('app-session-creator img.flag:nth-child(2)').click()
    cy.contains('Bienvenue à ZSKarte 2 !')
    cy.get('app-session-creator img.flag:last-child').click()
    cy.contains('Welcome to ZSKarte 2!')
  })
})
