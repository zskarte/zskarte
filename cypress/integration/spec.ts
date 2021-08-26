describe('Signup and draw', () => {
  before(() => {
    cy.visit('/');
  });

  it('Changes language', () => {
    cy.contains('Willkommen bei Zivilschutz-Karte!');
    cy.get('mat-select').first().click();
    cy.get('mat-option').eq(1).click();
    cy.contains('Bienvenue à Zivilschutz-Karte!');
    cy.get('mat-select').first().click();
    cy.get('mat-option').eq(2).click();
    cy.contains('Welcome to Zivilschutz-Karte!');
  });

  it('Allows guest sign-up', () => {
    const title = 'TEST';
    cy.get('mat-select[name=zsoId]').click();
    cy.get('mat-option').first().click();
    cy.get('input[name=title]').type(title + '{enter}');
    cy.get('app-help button').click();
    cy.get('app-toolbar mat-card-title').contains(title);
  });

  it('Changes coordinate projection', () => {
    cy.get('.ol-layer').last().click(200, 200);

    cy.get('app-drawlayer button').contains(`E2599`);
    cy.get('app-drawlayer button').click();
    cy.get('app-drawlayer button').contains('E7.43');
    cy.get('app-drawlayer button').click();
    cy.get('app-drawlayer button').contains(`E2599`);
  });

  it('Should draw polygon', () => {
    cy.get('app-drawingtools button').click();
    cy.get('button[mat-menu-item]').contains('Polygon').click();

    cy.get('.ol-layer')
      .last()
      .click(500, 200)
      .click(500, 300)
      .click(600, 300)
      .click(500, 200);

    cy.get('app-selected-feature mat-label').contains('Name');
  });
});
