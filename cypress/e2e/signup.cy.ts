describe('Signup Flow - verification code', () => {
  let testEmail: string;

  beforeEach(() => {
    // Generate random email
    testEmail = `test${Math.random().toString(36).substring(7)}@example.com`;
    cy.visit('/signup')
  })

  it('should create user in database after sending verification code', () => {
    // Step 1: Type email and click Send Code
    cy.get('input[name="email"]').type(testEmail)
    cy.get('button').contains('Send Code').click()
    
    // Step 2: Wait for API call to complete
    cy.wait(2000)
    
    // Step 3: Check database via API
    cy.request({
      method: 'GET',
      url: `/api/users/by-email?email=${testEmail}`
    }).then((response) => {
      expect(response.status).to.eq(200)
      expect(response.body.user.email).to.eq(testEmail)
      expect(response.body.user.is_temporary).to.be.true
      expect(response.body.user.verificationCode).to.exist
    })
  })
})

describe('Login Flow - signup', () => {
  let testEmail: string;
  let testPassword: string;
  let verificationCode: string;

  beforeEach(() => {
    testEmail = `test${Math.random().toString(36).substring(7)}@example.com`;
    testPassword = `password${Math.random().toString(36).substring(7)}`;
    cy.visit('/')
  })

  it('should signup', () => {
    // Step 1: Complete signup first
    cy.visit('/signup')
    cy.get('input[name="email"]').type(testEmail)
    cy.get('button').contains('Send Code').click()
    cy.wait(2000)
    
    // Get verification code from database and complete signup
    cy.request({
      method: 'GET',
      url: `/api/users/by-email?email=${testEmail}`
    }).then((response) => {
      verificationCode = response.body.user.verificationCode
      
      // Complete signup with the verification code
      cy.get('input[name="password"]').type(testPassword)
      cy.get('input[name="confirmPassword"]').type(testPassword)
      cy.get('input[name="verificationCode"]').type(verificationCode)
      cy.get('button[type="submit"]').click()
      
      // Wait for the API call to complete and redirect
      cy.wait(3000)
      // Check that we're redirected to the home page
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  
  })
})