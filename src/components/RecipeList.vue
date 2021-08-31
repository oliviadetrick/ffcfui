<template>
    <div class="container">
        <h1 class="display-6 text-light">Recipes</h1>
        <ul class="list-group">
            <li v-for="item in recipes" :key="item.ID" class="list-group-item">
                <div class="row">
                    <label class="col-sm-4 col-form-label" v-bind:for="`recipe-${item.ID}`">
                        <FF14Icon v-bind:image-id="item.ItemResult.Icon" />
                        {{ item.ItemResult.Name }}
                    </label>
                    <div class="col-sm-8">
                        <div class="input-group">
                            <input
                                class="form-control"
                                type="number"
                                v-bind:name="`recipe-${item.ID}`"
                                v-on:change="itemChanged(item, $event)"
                                v-bind:value="item.Multiplier"
                                v-bind:title="item.ItemResult.Name"
                                v-bind:placeholder="item.ItemResult.Name || ''"
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
    import FF14Icon from "./FF14Icon";

    export default {
        name: "RecipeList",
        components: {
            FF14Icon,
        },
        props: {
            recipes: Array,
        },
        methods: {
            itemChanged: function(item, e) {
                this.$emit("itemChanged", item, parseInt(e.srcElement.value));
            },
            itemRemoved: function(item) {
                this.$emit("itemRemoved", item);
            },
        },
    };
</script>
