describe('SignIn Component Test', () => {
    it('logs in with valid credentials', () => {
      cy.visit('http://localhost:5252'); // vagy ahol a SignIn van
  
      // Kitöltjük a mezőket
      cy.get('input[name="username"]').type('tesztuser');
      cy.get('input[name="password"]').type('tesztjelszo');
  
      // Rányomunk a login gombra
      cy.get('.auth-button').click();
  
      // Ellenőrizzük az átirányítást
      cy.url().should('include', '/mainPage');
    });
  
    it('shows error if fields are empty', () => {
      cy.visit('http://localhost:3000');
  
      cy.get('.auth-button').click();
  
      // Feltételezve, hogy hibaüzenet jelenik meg
      cy.contains('Please fill out all fields').should('exist');
    });
  });
  