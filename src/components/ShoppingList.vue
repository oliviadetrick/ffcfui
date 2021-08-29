<template>
    <div class="container">
        <h1 class="display-6 text-light">Materials List</h1>
        <div class="list-group bg-dark">
            <label class="list-group-item">
                <div class="container">
                    <div class="row">
                        <div class="col-2">
                            <SortColumnLink text="Completed" />
                        </div>
                        <div class="col-2">
                            <SortColumnLink
                                column-name="count"
                                text="Count"
                                title="Sort Count"
                                v-on:click="sort"/>
                        </div>
                        <div class="col-8">
                            <SortColumnLink
                                column-name="name"
                                text="Name"
                                title="Sort Name"
                                v-on:click="sort"
                            />
                        </div>
                    </div>
                </div>
            </label>
            <label
                v-for="node in rawMaterials"
                :key="node.ItemID"
                class="list-group-item">
                <div class="container">
                    <div class="row">
                        <div class="col-2">
                            <input
                                class="form-check-input me-1"
                                type="checkbox"
                                v-bind:title="node.value + ' ' + node.Name"/>
                        </div>
                        <div class="col-2">
                            <span class="badge rounded-pill bg-secondary">{{
                                node.value
                            }}</span>
                        </div>
                        <div class="col-8">
                            <FF14Icon v-bind:image-id="node.Icon" />
                            <span class="ms-2">{{ node.Name }}</span>
                        </div>
                    </div>
                </div>
            </label>
        </div>
    </div>
</template>

<script>
    import FF14Icon from "./FF14Icon";
    import SortColumnLink from "./SortColumnLink";

    export default {
        name: "ShoppingList",
        components: {
            FF14Icon,
            SortColumnLink,
        },
        props: {
            nodes: Array,
        },
        computed: {
            rawMaterials: function() {
                return this.nodes.filter(node => node.Resource === true);
            },
        },
        methods: {
            sort: function(columnLink) {
                this.$emit("sort", columnLink);
            },
        },
    };
</script>
