import { COMPONENT_TRAIT, type ComponentTrait } from '../src/portable';

// 新 trait 常量自动进入 ComponentTrait 联合类型
const readonlyAppearance: ComponentTrait = COMPONENT_TRAIT.PRESENTATION_READONLY_APPEARANCE;
void readonlyAppearance;

// 类型契约：任意字符串不能直接作为 ComponentTrait
// @ts-expect-error 任意字符串不是合法的 ComponentTrait
const notATrait: ComponentTrait = 'Not.A.Real.Trait';
void notATrait;
