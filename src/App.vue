<template>
    <BSNavBar nav-brand="FFCF" nav-class="navbar-dark" toggle-id="nav-main">
        <BSNavBarNav :items="views" />
        <BSNavSearch id="searchBox" @select="onSelectRecipe" />
    </BSNavBar>
    <div class="row g-1">
        <Index id="index" v-show="views[0].active" />
        <RecipeList
            id="recipeList"
            :items="recipes"
            v-on:itemChanged="onRecipeChanged"
            v-on:itemRemoved="onRecipeRemoved"
            v-show="!views[0].active"/>
        <ShoppingList
            id="shoppingList"
            :nodes="shoppingData"
            v-on:sort="onShoppingSorted"
            v-show="views[1].active"/>
        <CraftingGuide
            id="craftingGuide"
            :nodes="nodes"
            :links="links"
            v-show="views[2].active"/>
        <CraftingDiagram
            id="sankeyDiagram"
            :nodes="nodes"
            :links="links"
            v-show="views[3].active"/>
    </div>
</template>

<script>
    import { json } from "d3";

    import BSNavBar from "./components/BSNavBar.vue";
    import BSNavBarNav from "./components/BSNavBarNav.vue";
    import BSNavSearch from "./components/BSNavSearch.vue";
    import CraftingDiagram from "./components/CraftingDiagram.vue";
    import CraftingGuide from "./components/CraftingGuide.vue";
    import Index from "./components/Index.vue";
    import RecipeList from "./components/RecipeList.vue";
    import ShoppingList from "./components/ShoppingList.vue";

    export default {
        name: "App",
        components: {
            BSNavBar,
            BSNavBarNav,
            BSNavSearch,
            CraftingDiagram,
            CraftingGuide,
            Index,
            RecipeList,
            ShoppingList,
        },
        data: function() {
            return {
                craftingIndex: 0,
                nodeIDs: [],
                nodes: [],
                recipes: [],
                links: [],
                sortInfo: {
                    shopping: {
                        count: null,
                        done: null,
                        name: null,
                    },
                },
                views: [
                    {
                        active: true,
                        text: "Home",
                        name: "index",
                    },
                    {
                        active: false,
                        text: "Materials List",
                        name: "list",
                    },
                    {
                        active: false,
                        text: "Crafting Guide",
                        name: "craftguide",
                    },
                    {
                        active: false,
                        text: "Diagram",
                        name: "diagram",
                    },
                ],
            };
        },
        computed: {
            shoppingData: function() {
                let list = this.nodes;
                let fn;
                if (typeof this.sortInfo.shopping.count === "string") {
                    fn =
                        this.sortInfo.shopping.count === "asc"
                            ? (a, b) => a.value - b.value
                            : (a, b) => b.value - a.value;
                }
                if (typeof this.sortInfo.shopping.name === "string") {
                    if (typeof fn === "function") {
                        fn =
                            this.sortInfo.shopping.name === "asc"
                                ? (a, b) =>
                                      a.value - b.value ||
                                      a.Name.localeCompare(b.Name)
                                : (a, b) =>
                                      b.value - a.value ||
                                      b.Name.localeCompare(a.Name);
                    } else {
                        fn =
                            this.sortInfo.shopping.name === "asc"
                                ? (a, b) => a.Name.localeCompare(b.Name)
                                : (a, b) => b.Name.localeCompare(a.Name);
                    }
                }
                return list.sort(fn);
            },
        },
        methods: {
            addRecipe: function(recipe) {
                let resultNode = this.getOrCreateNode(recipe.ItemResult);
                resultNode.Resource = false;
                let craftNode = this.createNode(recipe.CraftType);
                this.pushNode(craftNode);
                this.links.push(
                    this.createLink(
                        craftNode,
                        resultNode,
                        recipe.AmountResult * recipe.Multiplier
                    )
                );
                for (let i = 0; i <= 9; i++) {
                    let ingredient = recipe["ItemIngredient" + i];
                    let ingredientRecipe = recipe["ItemIngredientRecipe" + i];
                    let ingredientNode = null;
                    if (
                        typeof ingredientRecipe === "object" &&
                        ingredientRecipe !== null
                    ) {
                        if (Array.isArray(ingredientRecipe)) {
                            ingredientRecipe = ingredientRecipe[0];
                        }
                        ingredientRecipe.Multiplier = recipe.Multiplier;
                        ingredientNode = this.addRecipe(ingredientRecipe);
                    } else if (
                        typeof ingredient === "object" &&
                        ingredient !== null
                    ) {
                        ingredientNode = this.getOrCreateNode(ingredient);
                    }
                    if (ingredient !== null) {
                        this.links.push(
                            this.createLink(
                                ingredientNode,
                                craftNode,
                                parseInt(recipe["AmountIngredient" + i]) *
                                    recipe.Multiplier
                            )
                        );
                    }
                }
                return resultNode;
            },
            createLink: function(source, target, value) {
                return {
                    source: source.ItemID,
                    target: target.ItemID,
                    value: value,
                };
            },
            createNode: function(source) {
                if (source.MainPhysical) {
                    // crafting
                    this.craftingIndex = this.craftingIndex - 1;
                    return {
                        ItemID: this.craftingIndex,
                        Name: source.Name,
                    };
                } else {
                    // item
                    return {
                        ItemID: source.ID,
                        Name: source.Name,
                        Description: source.Description,
                        Resource: typeof source.Recipe === "undefined",
                        Icon: source.Icon,
                    };
                }
            },
            getNode: function(id) {
                let i = this.nodes.findIndex(n => n.ItemID === id);
                return i >= 0 ? this.nodes[i] : null;
            },
            getOrCreateNode: function(ingredient) {
                let node = this.getNode(ingredient.ID);
                if (node === null) {
                    node = this.createNode(ingredient);
                    this.pushNode(node);
                }
                return node;
            },
            loadRecipe: async function(id) {
                if (this.recipes.findIndex(r => r.ID === id) < 0) {
                    let data = await json("https://xivapi.com/recipe/" + id);
                    if (typeof data === "object") {
                        data.Multiplier = 1;
                        this.recipes.push(data);
                        this.addRecipe(data);
                    }
                }
            },
            onRecipeChanged: function(recipe, newValue) {
                let i = this.recipes.indexOf(recipe);
                if (i >= 0 && recipe.Multiplier > 0) {
                    this.recipes[i].Multiplier = newValue;
                    this.rebuild();
                }
            },
            onRecipeRemoved: function(recipe) {
                let i = this.recipes.indexOf(recipe);
                if (i >= 0) {
                    this.recipes.splice(i, 1);
                    this.rebuild();
                }
            },
            onSelectRecipe: async function(value) {
                await this.loadRecipe(value);
            },
            onShoppingSorted: function(columnLink) {
                if (!(columnLink instanceof PointerEvent)) {
                    let sortInfo = this.sortInfo.shopping[
                        columnLink.columnName
                    ];
                    if (sortInfo === null) {
                        sortInfo = "asc";
                    } else if (sortInfo === "asc") {
                        sortInfo = "desc";
                    } else {
                        sortInfo = null;
                    }
                    columnLink.sortDirection = sortInfo;
                    this.sortInfo.shopping[columnLink.columnName] = sortInfo;
                }
            },
            pushNode: function(node) {
                if (!this.nodeIDs.includes(node.ItemID)) {
                    this.nodeIDs.push(node.ItemID);
                    this.nodes.push(node);
                }
            },
            rebuild: function() {
                this.links.splice(0, this.links.length);
                this.nodes.splice(0, this.nodes.length);
                this.nodeIDs.splice(0, this.nodeIDs.length);
                this.craftingIndex = 0;
                for (let i = 0; i < this.recipes.length; i++) {
                    this.addRecipe(this.recipes[i]);
                }
            },
        },
    };
</script>
