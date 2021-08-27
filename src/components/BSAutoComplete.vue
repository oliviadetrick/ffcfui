<template>
    <div class="dropdown" v-bind:id="id">
        <input
            class="form-control me-2 dropdown-toggle"
            v-on:keydown="onKeyDown($event)"
            v-on:click="onClick($event)"
            v-on:input="onInput($event)"
            type="search"
            placeholder="Search"
            autocomplete="off"
            data-bs-toggle="dropdown"
            aria-label="Search" />
        <div class="dropdown-menu" />
    </div>
</template>

<script>
    import { Dropdown } from "bootstrap";

    //Original from https://github.com/gch1p/bootstrap-5-autocomplete
    export default {
        name: "BSAutoComplete",
        props: {
            highlightClass: {
                type: String,
                default: "text-primary",
            },
            highlightTyped: {
                type: Boolean,
                default: true,
            },
            id: String,
            label: {
                type: String,
                default: "label",
            },
            maximumItems: {
                type: Number,
                default: 5,
            },
            onSelectItem: Function,
            showValue: {
                type: Boolean,
                default: false,
            },
            threshold: {
                type: Number,
                default: 3,
            },
            value: {
                type: String,
                default: "value",
            },
        },
        data: function() {
            return {
                data: [],
                searching: false,
            };
        },
        methods: {
            ce: function(html) {
                let div = document.createElement("div");
                div.innerHTML = html;
                return div.firstChild;
            },
            createItem: function(lookup, item) {
                let label;
                if (this.highlightTyped) {
                    const idx = item.label
                        .toLowerCase()
                        .indexOf(lookup.toLowerCase());
                    const className = Array.isArray(this.highlightClass)
                        ? this.highlightClass.join(" ")
                        : typeof this.highlightClass == "string"
                        ? this.highlightClass
                        : "";
                    label =
                        item.label.substring(0, idx) +
                        `<span class="${className}">${item.label.substring(
                            idx,
                            idx + lookup.length
                        )}</span>` +
                        item.label.substring(
                            idx + lookup.length,
                            item.label.length
                        );
                } else {
                    label = item.label;
                }

                if (this.showValue) {
                    label += ` ${item.value}`;
                }
                return this.ce(
                    `<button type="button" class="dropdown-item" data-label="${item.label}" data-value="${item.value}">${label}</button>`
                );
            },
            createItems: function() {
                const dropdown = this.getDropDown();
                const field = dropdown._element.getElementsByTagName(
                    "input"
                )[0];
                const lookup = field.value;
                if (lookup.length < this.treshold) {
                    dropdown.hide();
                    return 0;
                }

                const items = field.nextSibling;
                items.innerHTML = "";

                const keys = Object.keys(this.data);

                let count = 0;
                for (let i = 0; i < keys.length; i++) {
                    const key = keys[i];
                    const entry = this.data[key];
                    const item = {
                        label: this.label ? entry[this.label] : key,
                        value: this.value ? entry[this.value] : entry,
                    };

                    if (
                        item.label
                            .toLowerCase()
                            .indexOf(lookup.toLowerCase()) >= 0
                    ) {
                        items.appendChild(this.createItem(lookup, item));
                        if (
                            this.maximumItems > 0 &&
                            ++count >= this.maximumItems
                        )
                            break;
                    }
                }

                field.nextSibling
                    .querySelectorAll(".dropdown-item")
                    .forEach(item => {
                        item.addEventListener("click", e => {
                            let dataLabel = e.target.getAttribute("data-label");
                            let dataValue = e.target.getAttribute("data-value");

                            //this.field.value = dataLabel;
                            if (this.onSelectItem) {
                                this.onSelectItem(dataLabel, dataValue);
                            }

                            dropdown.hide();
                        });
                    });
                return items.childNodes.length;
            },
            getDropDown: function() {
                return Dropdown.getOrCreateInstance(
                    document.getElementById(this.id)
                );
            },
            onClick: function(e) {
                if (this.createItems() === 0) {
                    e.stopPropagation();
                    let dropdown = this.getDropDown();
                    dropdown.hide();
                }
            },
            onInput: function() {
                this.renderIfNeeded();
            },
            onKeyDown: function(e) {
                if (e.keyCode === 27) {
                    let dropdown = this.getDropDown();
                    dropdown.hide();
                    return;
                }
                if (e.keyCode === 40) {
                    let dropdown = this.getDropDown();
                    dropdown._menu.children[0]?.focus();
                    return;
                }
            },
            renderIfNeeded: function() {
                if (this.createItems() > 0) {
                    let dropdown = this.getDropDown();
                    dropdown.show();
                } else {
                    document.getElementById(this.id).click();
                }
            },
            search: function() {},
            setData: function(data) {
                this.data = data;
                this.renderIfNeeded();
            },
        },
    };
</script>
