/* global context, it, cy, before, after, expect */
const headers = {
  authorization: ''
}
context('Scripts', () => {
  before(() => {
    cy.loginByUi('demo', '12345678')
      .then(xhr => {
        headers.authorization = 'Bearer ' + xhr.response.body.access_token
      })
    cy.wait(500)
  })
  after(() => { cy.logout() })

  const randomHash = Math.random().toString(32).substr(2)

  context('Scripts page', () => {
    it('Contains a title', () => {
      cy.visit('/admin/file')
        .then(() => {
          cy.get('span[data-hook=title]')
            .should('exist')
        })
    })

    it('Create script button exists', () => {
      cy.contains('Create New File')
        .should('exist')
    })
  })

  context('Create modal', () => {
    it('Create button opens modal', () => {
      cy.contains('Create New File')
        .click()
        .wait(200)
      cy.get('div.modalizer')
        .should('exist')
    })
    it('Filename input requires extension', () => {
      cy.get('input[name=filename]').as('filenameInput')
        .should('exist')
      cy.get('textarea[name=description]').as('descriptionTextarea')
        .should('exist')

      cy.get('@filenameInput').closest('.form-group').within(() => {
        cy.get('@filenameInput')
          .type('test_' + randomHash)
        cy.get('@descriptionTextarea')
          .focus()
        cy.get('[data-hook=message-container]')
          .contains('needs an extension')
          .should('exist')
        cy.get('@filenameInput')
          .type('.sh')
      })
    })
    it('Add script content', () => {
      cy.get('div.modalizer').within($el => {
        const cm = $el.find('.CodeMirror')[0].CodeMirror
        cm.setValue('echo "success"')
      })
    })
    it('Saves the new script', () => {
      cy.server()
      cy.route('POST', '/apiv2/file').as('postScript')
      cy.get('button[data-hook=confirm]').scrollIntoView()
        .should('be.visible')
        .click()
      cy.wait('@postScript')
        .its('status')
        .should('equal', 200)

      cy.contains('test_' + randomHash + '.sh')
        .should('exist')
    })
    // it('Close the create modal', () => {
    //   cy.get('button.btn[data-dismiss=modal]').scrollIntoView()
    //     .should('be.visible')
    //     .click()
    // })
  })
  let scriptId = ''

  context('Edit modal', () => {
    it('Should open edit modal', () => {
      cy.contains('test_' + randomHash + '.sh')
        .closest('.itemRow')
        .as('row')
      cy.get('@row').within($el => {
        scriptId = $el.data('item-id')
        cy.get('.panel-item.icons.dropdown > button')
          .click()
        cy.wait(200)
        cy.get('.panel-item.icons.dropdown')
          .should('have.class', 'open')
        cy.get('button[data-original-title="Edit File"]')
          .should('exist')
          .and('be.visible')
          .click()
          .wait(200)
      })
      cy.get('div.modalizer').should('exist')
    })
    it('Should edit the script', () => {
      cy.get('div.modalizer').within($el => {
        // cy.get('.CodeMirror-code')
        //   .click()
        //   .type('{enter}# some comment ' + Math.random().toString(32), {force: true, delay: 25})
        // fuck the CodeMirror, use browser to get element then instance
        const cm = $el.find('.CodeMirror')[0].CodeMirror
        cm.setValue(cm.getValue() + '\n# some comment ' + randomHash)
      })
    })
    it('Should save the script', () => {
      cy.server()
      cy.route('PUT', '/apiv2/file/' + scriptId).as('putScript')
      cy.get('button[data-hook=confirm]').scrollIntoView()
        .should('be.visible')
        .click()
      cy.wait('@putScript')
        .its('status')
        .should('equal', 200)
        .then(xhr => {
          // console.log(xhr)
          // this doesn't work as scripts come with some atob/btoa
          // cy.request('/apiv2/file/' + scriptId, {headers})
          //   .its('body').should('include', randomHash)
          // execute the whole opening again to check the contents
          // -----------------------------------------------------
          cy.contains('test_' + randomHash + '.sh').closest('.itemRow').as('row')
          cy.get('@row').within($el => {
            // skip, as the dropdown is (should) still open
            // cy.get('.panel-item.icons.dropdown > button')
            //   .click()
            // cy.wait(200)
            cy.get('.panel-item.icons.dropdown')
              .should('have.class', 'open')
            cy.get('button[data-original-title="Edit File"]')
              .should('exist')
              .and('be.visible')
              .click()
          })
          cy.get('div.modalizer').as('editModal').should('exist')
          cy.get('@editModal').within($el => {
            const cm = $el.find('.CodeMirror')[0].CodeMirror
            expect(cm.getValue()).to.contain(randomHash)
            cy.get('button.btn[data-dismiss=modal]').scrollIntoView()
              .should('be.visible')
              .click()
          })
        })
    })
  })
  context('Cleanup', () => {
    it('Delete script', () => {
      cy.contains('test_' + randomHash + '.sh').closest('.itemRow').as('row')
      cy.get('@row').within($el => {
        cy.get('.panel-item.icons.dropdown > button')
          .click()
        cy.wait(200)
        cy.get('.panel-item.icons.dropdown')
          .should('have.class', 'open')
        cy.get('button[data-original-title="Delete File"]')
          .should('exist')
          .and('be.visible')
          .click()
      })
    })
    it('Shows delete confirmation', () => {
      cy.server()
      cy.route('DELETE', '/apiv2/file/' + scriptId).as('deleteScript')

      cy.get('.bootbox.bootbox-confirm')
        .should('exist')
      cy.get('[data-bb-handler=confirm]')
        .click()
        .wait(200)

      cy.wait('@deleteScript')
        .its('status')
        .should('equal', 200)
    })
  })
})
