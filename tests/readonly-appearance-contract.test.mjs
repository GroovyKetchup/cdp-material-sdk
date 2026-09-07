import assert from 'node:assert/strict';
import test from 'node:test';

import { COMPONENT_TRAIT } from '../dist/portable.js';

test('portable entry exports the readonly appearance trait', () => {
  assert.equal(
    COMPONENT_TRAIT.PRESENTATION_READONLY_APPEARANCE,
    'Presentation.ReadOnlyAppearance',
  );
});
