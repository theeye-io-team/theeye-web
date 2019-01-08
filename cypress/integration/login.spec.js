/* global context, it, cy, beforeEach, expect */

context('Login', () => {
  beforeEach(() => {
    cy.visit('https://development.theeye.io/login')
  })
  // afterEach(() => {
  //   cy.visit('/logout')
  // })
  it('Shows the login form', () => {
    cy.get('input[name=identifier]')
      .should('exist')
      .should('be.visible')

    cy.get('input[name=password]')
      .should('exist')
      .should('be.visible')

    cy.get('button[data-hook=start-login]')
      .should('exist')
      .should('be.visible')

    cy.contains('Register here')
      .should('exist')
      .should('be.visible')
  })

  it('Switches to register page and back', () => {
    cy.get('a[href=\\/register]').click()
    cy.get('input[name=name]')
      .should('exist')
      .should('be.visible')
    cy.get('input[name=email]')
      .should('exist')
      .should('be.visible')

    // cant use this selector, there are 2 links
    // cy.get('a[href=\\/login]').click()
    cy.contains('Back to login').click()
    cy.get('input[name=identifier]')
      .should('exist')
      .should('be.visible')
    cy.get('input[name=password]')
      .should('exist')
      .should('be.visible')
  })

  it('Handles demo user login/logout', () => {
    cy.loginByUi('demo', '12345678')
      .then((xhr, id) => expect(xhr.status).to.eq(200))
    cy.url().should('contain', 'dashboard')
    cy.logout()
  })

  it('Fails with a chot user', () => {
    cy.loginByUi('wronguser', 'with-a-wrong-password')
      .then((xhr, id) => {
        expect(xhr.status).to.eq(400)
        cy.get('.bootbox-body')
          .should('exist')
          .contains('error')
        cy.get('.modal-footer button').click()
      })
    cy.url().should('contain', 'login')
  })
})
