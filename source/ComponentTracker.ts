/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import ObjectRegistry, { IObjectEvent, getClassName } from "@ff/core/ObjectRegistry";

import Component, { ComponentOrClass } from "./Component";

////////////////////////////////////////////////////////////////////////////////

/**
 * Tracks components of a specific type in the same node.
 * Maintains a reference to the component if found and executes
 * callbacks if the component of the tracked type is added or removed.
 */
export default class ComponentTracker<T extends Component = Component>
{
    /** The type of component to track. */
    readonly className: string;
    /** Access to the component of the tracked type after it has been added. */
    component: T;
    /** Called after a component of the tracked type has been added to the node. */
    didAdd: (component: T) => void;
    /** Called before a component of the tracked type is removed from the node. */
    willRemove: (component: T) => void;

    private _registry: ObjectRegistry<Component>;

    constructor(registry: ObjectRegistry<Component>, scope: ComponentOrClass<T>,
                didAdd?: (component: T) => void, willRemove?: (component: T) => void) {

        this.className = getClassName(scope);
        this.didAdd = didAdd;
        this.willRemove = willRemove;

        this._registry = registry;

        registry.on(this.className, this.onComponent, this);
        this.component = registry.get(scope, true);

        if (this.component && didAdd) {
            didAdd(this.component);
        }
    }

    dispose()
    {
        this._registry.off(this.className, this.onComponent, this);
        this.component = null;
        this.didAdd = null;
        this.willRemove = null;

    }

    protected onComponent(event: IObjectEvent<T>)
    {
        if (event.add) {
            this.component = event.object;
            this.didAdd && this.didAdd(event.object);
        }
        else if (event.remove) {
            this.willRemove && this.willRemove(event.object);
            this.component = null;
        }
    }
}