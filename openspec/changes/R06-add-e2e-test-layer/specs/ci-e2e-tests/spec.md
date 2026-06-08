# Spec: ci-e2e-tests

## ADDED Requirements

### Requirement: Playwright Configuration

The system SHALL provide a Playwright test configuration file that defines:
- Base URL pointing to local dev server
- Viewport settings
- Timeout values
- Reporter options
- Worker count

### Requirement: Home Page E2E Tests

The system SHALL include e2e tests for the home page that verify:
- Page loads successfully (HTTP 200)
- Page title is present
- Terminal UI elements are visible
- Navigation to posts section works

### Requirement: Posts Listing E2E Tests

The system SHALL include e2e tests for the posts listing that verify:
- Posts list loads
- Post links are clickable
- Pagination navigation works if present

### Requirement: About Page E2E Tests

The system SHALL include e2e tests for the about page that verify:
- About page loads
- Content sections are visible

### Requirement: Accessibility Smoke Tests

The system SHALL include accessibility smoke tests using axe-core that verify:
- No critical accessibility violations on home page
- No critical accessibility violations on posts listing
- No critical accessibility violations on about page

## ADDED Scenarios

### Scenario: Home Page Load

**WHEN** the user navigates to the home page  
**THEN** the page loads successfully with visible terminal UI elements

### Scenario: Posts Navigation

**WHEN** the user clicks on the posts navigation link  
**THEN** the posts listing page loads and displays post links

### Scenario: About Page Load

**WHEN** the user navigates to the about page  
**THEN** the page loads with content sections visible

### Scenario: Accessibility Check

**WHEN** the accessibility smoke test runs
**THEN** no critical axe-core violations are detected on any tested page