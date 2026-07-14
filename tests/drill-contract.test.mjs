import assert from 'node:assert/strict';
import test from 'node:test';

import {
  COMPONENT_TRAIT,
  DRILL_ACTION,
  DRILL_EVENT,
  DRILL_STATE,
} from '../dist/portable.js';

test('portable entry exports the drill contract', () => {
  assert.equal(COMPONENT_TRAIT.INTERACTION_DRILLABLE, 'Interaction.Drillable');
  assert.deepEqual(DRILL_ACTION, {
    PUSH: 'drillPush',
    POP_TO: 'drillPopTo',
    RESET: 'drillReset',
  });
  assert.deepEqual(DRILL_STATE, { PATH: 'drillPath' });
  assert.deepEqual(DRILL_EVENT, {
    NAVIGATE_REQUEST: 'drill:navigateRequest',
    RESET_REQUEST: 'drill:resetRequest',
  });
});
