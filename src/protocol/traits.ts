export const COMPONENT_TRAIT = {
  DATA_FIELD: 'Data.Field',
  DATA_CONTAINER: 'Data.Container',
  LAYOUT_CONTAINER: 'Layout.Container',
  INTERACTION_CLICKABLE: 'Interaction.Clickable',
  INTERACTION_DRILLABLE: 'Interaction.Drillable',
  PRESENTATION_READONLY_APPEARANCE: 'Presentation.ReadOnlyAppearance',
} as const;

export type ComponentTrait = typeof COMPONENT_TRAIT[keyof typeof COMPONENT_TRAIT];
