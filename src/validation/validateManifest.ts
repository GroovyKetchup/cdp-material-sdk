/**
 * Manifest 校验工具
 *
 * 纯函数，零宿主依赖。第三方组件开发者可直接使用：
 *
 * ```ts
 * import { validateManifest } from 'cdp-material-sdk/portable';
 * const result = validateManifest(myManifest);
 * ```
 */

import { COMPONENT_CATEGORY } from '../types/category';
import type { ComponentManifest } from '../protocol/manifest';
import { normalizeManifestEvents, INJECT_PATH_ROOT } from '../protocol/manifest';
import { INJECT_PATH_SLOT_PROPS } from '../components/core/types';
import { COMPONENT_TRAIT } from '../protocol/traits';
import { normalizeAdapterEvents } from '../protocol/adapter';
import { isStandardEventKey, isCustomEventKey } from '../protocol/events';

const DATA_TRAITS = [COMPONENT_TRAIT.DATA_FIELD, COMPONENT_TRAIT.DATA_CONTAINER] as string[];

const KNOWN_INJECT_PATHS = [INJECT_PATH_ROOT, INJECT_PATH_SLOT_PROPS];


// ─── 公共类型 ─────────────────────────────────────────────

export interface ValidationError {
    type: string;
    field: string;
    message: string;
    severity: 'error' | 'warning';
}

export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

// ─── 内部工具 ─────────────────────────────────────────────

const VALID_JSON_SCHEMA_TYPES = ['string', 'number', 'boolean', 'array', 'object', 'integer', 'null'];

function push(target: ValidationError[], type: string, field: string, message: string, severity: 'error' | 'warning') {
    target.push({ type, field, message, severity });
}

// ─── 子校验器 ─────────────────────────────────────────────

function validateMeta(manifest: ComponentManifest, errors: ValidationError[], warnings: ValidationError[]) {
    const t = manifest.type;

    if (!manifest.meta) {
        push(errors, t, 'meta', 'meta 字段是必填的', 'error');
        return false; // meta 缺失，后续字段校验无意义
    }

    if (!manifest.meta.title) {
        push(errors, t, 'meta.title', 'title 是必填的', 'error');
    }

    if (!manifest.meta.category) {
        push(errors, t, 'meta.category', 'category 是必填的', 'error');
    } else {
        const validCategories = Object.values(COMPONENT_CATEGORY);
        if (!validCategories.includes(manifest.meta.category as any)) {
            push(errors, t, 'meta.category', `无效的 category: ${manifest.meta.category}`, 'error');
        }
    }

    if (manifest.meta.valueSchema) {
        const schemaType = manifest.meta.valueSchema.type;
        if (schemaType && typeof schemaType === 'string' && !VALID_JSON_SCHEMA_TYPES.includes(schemaType)) {
            push(errors, t, 'meta.valueSchema.type', `无效的 valueSchema type: ${schemaType}`, 'error');
        }
    }

    // trait ↔ valueSchema 交叉校验
    const hasDataTrait = manifest.traits?.some(tr => DATA_TRAITS.includes(tr));
    if (hasDataTrait && !manifest.meta.valueSchema) {
        push(warnings, t, 'meta.valueSchema',
            '声明了 DATA_FIELD 或 DATA_CONTAINER trait 但缺少 valueSchema——建议补充以供设计器和 AI 工具推断数据类型',
            'warning');
    }

    return true;
}

function validateEvents(manifest: ComponentManifest, errors: ValidationError[], warnings: ValidationError[]) {
    const t = manifest.type;
    const normalized = normalizeManifestEvents(manifest);
    const declaredStandardTypes = new Set(normalized.standard.map(e => e.type));
    const declaredCustomTypes = new Set(normalized.custom.map(e => e.type));

    if (normalized.all.length > 0) {
        normalized.standard.forEach((evt, i) => {
            if (!evt.type) {
                push(errors, t, `events[${i}].type`, '事件类型不能为空', 'error');
            }
            if (evt.type && !isStandardEventKey(evt.type)) {
                push(errors, t, `events[${i}].type`, `标准事件类型必须属于 EngineEventProtocol: ${evt.type}`, 'error');
            }
        });

        normalized.custom.forEach((evt) => {
            if (!evt.type) {
                push(errors, t, `customEvents.type`, '自定义事件类型不能为空', 'error');
            }
            if (evt.type && !isCustomEventKey(evt.type)) {
                push(errors, t, `customEvents.${evt.type}`, `自定义事件类型必须是 namespaced 形态: ${evt.type}`, 'error');
            }
            if (!evt.payloadSchema) {
                push(errors, t, `customEvents.${evt.type}.payloadSchema`, '自定义事件必须声明 payloadSchema', 'error');
            }
        });
    }

    // adapter 事件校验
    if (manifest.adapter) {
        const adapterNormalized = normalizeAdapterEvents(manifest.adapter);

        adapterNormalized.standard.forEach((ea, i) => {
            if (!ea.type) {
                push(errors, t, `adapter.events[${i}].type`, 'Adapter 事件类型不能为空', 'error');
            }
            if (ea.type && !isStandardEventKey(ea.type)) {
                push(errors, t, `adapter.events[${i}].type`, `Adapter 标准事件类型必须属于 EngineEventProtocol: ${ea.type}`, 'error');
            }
            if (ea.type && isStandardEventKey(ea.type) && !declaredStandardTypes.has(ea.type)) {
                push(errors, t, `adapter.events[${i}].type`, `Adapter 标准事件必须先在 manifest.events 中声明: ${ea.type}`, 'error');
            }
            if (!ea.propName) {
                push(errors, t, `adapter.events[${i}].propName`, 'Adapter propName 不能为空', 'error');
            }
        });

        adapterNormalized.custom.forEach((ea) => {
            if (!ea.type) {
                push(errors, t, `adapter.customEvents.type`, 'Adapter 自定义事件类型不能为空', 'error');
            }
            if (ea.type && !isCustomEventKey(ea.type)) {
                push(errors, t, `adapter.customEvents.${ea.type}`, `Adapter 自定义事件类型必须是 namespaced 形态: ${ea.type}`, 'error');
            }
            if (ea.type && isCustomEventKey(ea.type) && !declaredCustomTypes.has(ea.type)) {
                push(errors, t, `adapter.customEvents.${ea.type}`, `Adapter 自定义事件必须先在 manifest.customEvents 中声明: ${ea.type}`, 'error');
            }
            if (!ea.propName) {
                push(errors, t, `adapter.customEvents.${ea.type}.propName`, 'Adapter customEvents propName 不能为空', 'error');
            }
        });
    }
}

function validateActions(manifest: ComponentManifest, errors: ValidationError[], _warnings: ValidationError[]) {
    const t = manifest.type;
    const actions = manifest.actions;
    if (!actions) return;

    for (const [name, spec] of Object.entries(actions)) {
        if (!spec) continue;

        // title 是 ActionSpec 接口必填，但运行时可能被绕过
        if (!spec.title) {
            push(errors, t, `actions.${name}.title`, `动作 "${name}" 缺少 title`, 'error');
        }

        // returns 建议声明（对 AI 消费和设计器展示很重要）
        if (!spec.returns) {
            push(_warnings, t, `actions.${name}.returns`, `动作 "${name}" 未声明 returns schema，建议补充`, 'warning');
        }

        // params 如果声明了，检查基本结构
        if (spec.params) {
            if (spec.params.type !== 'object') {
                push(errors, t, `actions.${name}.params.type`, `动作参数 schema 的 type 必须为 "object"`, 'error');
            }
        }
    }
}

function validateRootPath(manifest: ComponentManifest, _errors: ValidationError[], warnings: ValidationError[]) {
    const t = manifest.type;
    const rootPath = manifest.engine?.render?.injection?.rootPath;

    if (!rootPath) {
        push(warnings, t, 'engine.render.injection.rootPath',
            '未声明 rootPath——引擎将在组件外层套 <div> 兜底。' +
            '推荐声明 INJECT_PATH_SLOT_PROPS 并在组件根节点透传 slotProps.root',
            'warning');
    } else if (typeof rootPath === 'string' && !KNOWN_INJECT_PATHS.includes(rootPath)) {
        push(warnings, t, 'engine.render.injection.rootPath',
            `rootPath "${rootPath}"：请确保组件内部将该路径对应的 props 透传到根 DOM 节点。若已按规则实现可忽略此提示`,
            'warning');
    }
}

function validateSlots(manifest: ComponentManifest, errors: ValidationError[], warnings: ValidationError[]) {
    const t = manifest.type;
    const slots = manifest.slots;
    if (!slots) return;

    for (const [name, def] of Object.entries(slots)) {
        if (!def) continue;

        // title 必填（设计器 UI 需要）
        if (!def.title) {
            push(errors, t, `slots.${name}.title`, `插槽 "${name}" 缺少 title`, 'error');
        }

        // 动态 slot 必须声明 dynamicSource + dynamicKey
        if (def.dynamic) {
            if (!def.dynamicSource) {
                push(errors, t, `slots.${name}.dynamicSource`, `动态插槽 "${name}" 缺少 dynamicSource`, 'error');
            }
            if (!def.dynamicKey) {
                push(errors, t, `slots.${name}.dynamicKey`, `动态插槽 "${name}" 缺少 dynamicKey`, 'error');
            }
        }

        // scoped slot 建议声明 scopeDescription
        if (def.scoped && !def.scopeDescription) {
            push(warnings, t, `slots.${name}.scopeDescription`,
                `作用域插槽 "${name}" 建议声明 scopeDescription，帮助设计器用户理解作用域数据`,
                'warning');
        }

        // allowedChildren 如果声明了必须是数组
        if (def.allowedChildren !== undefined && !Array.isArray(def.allowedChildren)) {
            push(errors, t, `slots.${name}.allowedChildren`, `插槽 "${name}" 的 allowedChildren 必须是字符串数组`, 'error');
        }
    }
}

function validateState(manifest: ComponentManifest, errors: ValidationError[], _warnings: ValidationError[]) {
    const t = manifest.type;
    const state = manifest.state;
    if (!state) return;

    for (const [name, spec] of Object.entries(state)) {
        if (!spec) continue;

        if (!spec.title) {
            push(errors, t, `state.${name}.title`, `状态 "${name}" 缺少 title`, 'error');
        }

        if (!spec.schema) {
            push(errors, t, `state.${name}.schema`, `状态 "${name}" 缺少 schema`, 'error');
        } else if (spec.schema.type && typeof spec.schema.type === 'string' && !VALID_JSON_SCHEMA_TYPES.includes(spec.schema.type)) {
            push(errors, t, `state.${name}.schema.type`, `状态 "${name}" 的 schema.type 无效: ${spec.schema.type}`, 'error');
        }
    }
}

// ─── 主入口 ───────────────────────────────────────────────

/**
 * 验证单个 ComponentManifest 的完整性和正确性。
 *
 * 校验范围：
 * - 必填字段（type, meta, meta.title, meta.category）
 * - events / customEvents 合法性
 * - adapter 与 events 对齐
 * - actions 声明完整性（title 必填，returns 建议）
 * - state 声明完整性（title + schema 必填）
 * - slots 声明完整性（title 必填，动态/作用域规则）
 * - engine.render.injection.rootPath 声明提示
 */
export function validateManifest(manifest: ComponentManifest): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // type 必填
    if (!manifest.type) {
        push(errors, manifest.type || 'Unknown', 'type', 'type 字段是必填的', 'error');
    }

    // meta 校验（如果 meta 缺失，提前返回）
    const metaOk = validateMeta(manifest, errors, warnings);
    if (!metaOk) {
        return { valid: false, errors, warnings };
    }

    // events + adapter
    validateEvents(manifest, errors, warnings);

    // actions
    validateActions(manifest, errors, warnings);

    // state
    validateState(manifest, errors, warnings);

    // slots
    validateSlots(manifest, errors, warnings);

    // rootPath
    validateRootPath(manifest, errors, warnings);

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * 批量验证多个 Manifest
 */
export function validateManifests(manifests: ComponentManifest[]): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationError[] = [];

    for (const manifest of manifests) {
        const result = validateManifest(manifest);
        allErrors.push(...result.errors);
        allWarnings.push(...result.warnings);
    }

    return {
        valid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
    };
}

// ─── 运行时一致性诊断（DEV 辅助） ──────────────────────────

/**
 * 比对 manifest.actions 中组件自声明的 action keys 与 ref 实际暴露的方法。
 * 返回"声明了但未实现"的 action 名称列表。
 *
 * 用于宿主 DEV 模式下的挂载时诊断。
 */
export function diagnoseMissingActionImpls(
    componentActionKeys: readonly string[] | undefined,
    refValue: Record<string, any> | null | undefined,
): string[] {
    if (!componentActionKeys || !refValue) return [];
    return componentActionKeys.filter(key => typeof refValue[key] !== 'function');
}

/**
 * 比对 manifest.state 声明的 key 与 __state 实际暴露的 key。
 * 返回"声明了但未暴露"的 state 名称列表。
 */
export function diagnoseMissingStateKeys(
    manifest: Pick<ComponentManifest, 'state'> | undefined,
    stateValue: Record<string, any> | null | undefined,
): string[] {
    if (!manifest?.state || !stateValue) return [];
    return Object.keys(manifest.state).filter(key => !(key in stateValue));
}

// ─── 格式化输出 ──────────────────────────────────────────

/**
 * 打印验证结果到控制台
 */
export function printValidationResult(result: ValidationResult): void {
    if (result.valid) {
        console.log('✅ 所有 Manifest 验证通过');
    } else {
        console.error(`❌ 发现 ${result.errors.length} 个错误`);
    }

    if (result.errors.length > 0) {
        console.error('\n错误列表:');
        result.errors.forEach(error => {
            console.error(`  ❌ [${error.type}] ${error.field}: ${error.message}`);
        });
    }

    if (result.warnings.length > 0) {
        console.warn(`\n⚠️  发现 ${result.warnings.length} 个警告`);
        result.warnings.forEach(warning => {
            console.warn(`  ⚠️  [${warning.type}] ${warning.field}: ${warning.message}`);
        });
    }
}

/**
 * 打印单个组件的验证结果（简洁格式）
 */
export function printSingleValidationResult(result: ValidationResult, prefix = '[Registry]'): void {
    if (!result.valid && result.errors.length > 0) {
        const type = result.errors[0]?.type || 'Unknown';
        console.error(`${prefix} ❌ Manifest validation failed for '${type}':`);
        result.errors.forEach(e => console.error(`  - ${e.field}: ${e.message}`));
    }

    if (result.warnings.length > 0) {
        const type = result.warnings[0]?.type || 'Unknown';
        console.warn(`${prefix} ⚠️  Manifest warnings for '${type}':`);
        result.warnings.forEach(w => console.warn(`  - ${w.field}: ${w.message}`));
    }
}
