<template>
    <div class="container">
        <h1 class="display-6 text-light">Recipes</h1>
        <ul class="list-group">
            <li v-for="item in recipes" :key="item.ID" class="list-group-item">
                <div class="row">
                    <label class="col-sm-4 col-form-label" v-bind:for="`recipe-${item.ID}`">
                        <FF14Icon v-bind:image-id="item.ItemResult.Icon" />
                        {{ item.ItemResult.Name }}
                        <i
                            data-bs-html="true"
                            data-bs-toggle="popover"
                            data-bs-trigger="hover click"
                            v-bind:title="item.ItemResult.Name"
                            v-bind:data-bs-title="item.ItemResult.Name"
                            v-bind:data-bs-content="getItemDetails(item)"
                            class="bi bi-question-circle recipe-popover"
                        ></i>
                        <a
                            v-bind:href="'https://na.finalfantasyxiv.com/lodestone/playguide/db/search/?q=' + item.ItemResult.Name"
                            target="_blank"
                            class="ms-1 link-dark"
                            v-bind:title="'Search Eorzea Database for \'' + item.ItemResult.Name + '\''">
                            <i class="bi bi-link"></i>
                        </a>
                    </label>
                    <div class="col-sm-8">
                        <div class="input-group">
                            <input
                                class="form-control"
                                type="number"
                                v-bind:name="`recipe-${item.ID}`"
                                v-on:change="itemChanged(item, $event)"
                                v-bind:value="item.Multiplier"
                                v-bind:title="'Quantity of ' + item.ItemResult.Name"
                                placeholder="Quantity"
                                min="1"
                            />
                            <button
                                class="btn btn-outline-danger"
                                type="button"
                                v-on:click="itemRemoved(item)"
                                title="Delete"
                            >
                                X
                            </button>
                        </div>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</template>

<script>
    import { Popover } from "bootstrap";
    import FF14Icon from "./FF14Icon";

    export default {
        name: "RecipeList",
        components: {
            FF14Icon,
        },
        updated: function() {
            let elements = document.getElementsByClassName("recipe-popover");
            for (let i = 0; i < elements.length; i++) {
                let el = elements.item(i);
                let o = Popover.getInstance(el);
                if (o) {
                    o.dispose();
                }
                Popover.getOrCreateInstance(el);
            }
        },
        props: {
            recipes: Array,
        },
        methods: {
            getItemDetails: function(item) {
                let html = `<strong>${item.CraftType.Name} lvl ${item.RecipeLevelTable.ClassJobLevel}</strong>`;
                if (item.SecretRecipeBook) {
                    html = html + `<br/>${item.SecretRecipeBook.Name}`;
                }
                if (item.ItemResult.Description.length > 0) {
                    item = item + `<br/><em>${item.ItemResult.Description}<em>`;
                }
                return html;
            },
            itemChanged: function(item, e) {
                this.$emit("itemChanged", item, parseInt(e.srcElement.value));
            },
            itemRemoved: function(item) {
                this.$emit("itemRemoved", item);
            },
        },
    };
</script>
