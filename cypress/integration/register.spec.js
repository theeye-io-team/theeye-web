/* global context, it, cy, beforeEach */

context('Register', () => {
  beforeEach(() => {
    cy.visit('https://development.theeye.io/register')
  })
  it('Shows the register form', () => {
    cy.get('input[name=name]')
      .should('exist')
      .should('be.visible')
    cy.get('input[name=email]')
      .should('exist')
      .should('be.visible')
  })
  it('Rejects an existing user', () => {
    cy.server()
    cy.route('POST', '/registeruser').as('postRegister')

    cy.get('input[name=name]').type('demo')
    cy.get('input[name=email]').type('demo@interactar.com')
    cy.get('button[data-hook=start-register]').click()
    cy.wait('@postRegister')
      .its('status')
      .should('equal', 400)
      .then(xhr => {
        cy.get('.bootbox-body')
          .should('exist')
          .contains('email is taken')
      })
  })

  it('Registers a random demo user minion', () => {
    const ran = Math.random().toString(36).substr(2, 9)
    cy.server()
    cy.route('POST', '/registeruser').as('postRegister')

    cy.get('input[name=name]').type('test_deletable_' + ran)
    cy.get('input[name=email]').type('test+deletable_' + ran + '@theeye.io')
    cy.get('button[data-hook=start-register]').click()
    cy.wait('@postRegister')
      .its('status')
      .should('equal', 200)
      .then(xhr => {
        cy.contains('Go to login').should('exist')
      })
  })
})
