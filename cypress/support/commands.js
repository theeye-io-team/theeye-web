/* global Cypress cy */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('loginByUi', (username, password) => {
  Cypress.log({
    name: 'loginByUi',
    message: username + ' | ' + password
  })

  cy.server()
  cy.route('POST', '/auth/login').as('postLogin')
  // cy.route('GET', '/session/profile').as('getSessionProfile')
  cy.visit('/login')
  cy.get('input[name=identifier]')
    .type(username)

  cy.get('input[name=password]')
    .type(password)

  cy.get('button[data-hook=start-login]')
    .click()
    // .wait('@getSessionProfile')
    .wait('@postLogin')
    // .its('status').should('equal', 200)
})
Cypress.Commands.add('logout', () => {
  cy.server()
  cy.route('GET', '/session/logout').as('getLogout')

  cy.visit('/logout')

  cy.wait('@getLogout')
    // .its('status').should('equal', 200)
})
