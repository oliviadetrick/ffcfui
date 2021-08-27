<template>
    <BSNavBar nav-brand="FFCF" nav-class="navbar-dark" toggle-id="nav-main">
        <BSNavBarNav v-on:switchView="switchView" :items="views" />
        <BSNavSearch id="searchBox" @select="onSelectRecipe" />
    </BSNavBar>
    <div class="row g-1">
        <RecipeList
            id="recipeList"
            :items="recipes"
            v-on:itemChanged="onRecipeChanged"
            v-on:itemRemoved="onRecipeRemoved"
        />
        <ShoppingList
            id="shoppingList"
            :nodes="shoppingData"
            v-on:sort="onShoppingSorted"
        />
        <CraftingGuide id="craftingGuide" :nodes="nodes" :links="links" />
        <CraftingDiagram id="sankeyDiagram" :nodes="nodes" :links="links" />
    </div>
</template>

<script>
    import { json } from "d3";

    import BSNavBar from "./components/BSNavBar.vue";
    import BSNavBarNav from "./components/BSNavBarNav.vue";
    import BSNavSearch from "./components/BSNavSearch.vue";
    import CraftingDiagram from "./components/CraftingDiagram.vue";
    import CraftingGuide from "./components/CraftingGuide.vue";
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
                craftingTypes: [
                    "Carpentry",
                    "Blacksmithing",
                    "Armorsmithing",
                    "Goldsmithing",
                    "Leatherworking",
                    "Weaving",
                    "Alchemy",
                    "Culinary",
                ],
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
            addRecipe: async function(id) {
                if (this.recipes.findIndex(r => r._id === id) < 0) {
                    let data = await json("http://localhost:3000/recipe/" + id);
                    if (data !== undefined) {
                        data.Multiplier = 1;
                        this.recipes.push(data);
                        this.addRecipeNode(data);
                    }
                }
            },
            addRecipeNode: function(recipe) {
                // create recipe node if needed
                let recipeNode = this.getNode(recipe.Result._id);
                if (recipeNode === null) {
                    recipeNode = this.createNode(recipe);
                    this.pushNode(recipeNode);
                }
                // create crafting node and link
                let craftNode = this.createNode(recipe.CraftType);
                this.pushNode(craftNode);
                this.links.push(
                    this.createLink(
                        craftNode,
                        recipeNode,
                        recipeNode.Quantity
                    )
                );
                // create ingredient nodes and links
                for (let i = 0; i < recipeNode.Ingredients.length; i++) {
                    let ingredient = recipeNode.Ingredients[i];
                    let ingredientNode = this.getNode(ingredient.ItemID);
                    if (ingredientNode === null) {
                        if (ingredient.Item.Recipe) {
                            ingredientNode = this.addRecipeNode(ingredient.Item.Recipe);
                        } else {
                            ingredientNode = this.createNode(ingredient.Item);
                            this.pushNode(ingredientNode);
                        }
                    }
                    this.links.push(
                        this.createLink(
                            ingredientNode,
                            craftNode,
                            ingredient.Amount
                        )
                    );
                }
                return recipeNode;
            },
            createLink: function(source, target, value) {
                return {
                    source: source.ItemID,
                    target: target.ItemID,
                    value: value,
                };
            },
            createNode: function(source) {
                if (typeof source === "number") {
                    // crafting
                    this.craftingIndex = this.craftingIndex - 1;
                    return {
                        ItemID: this.craftingIndex,
                        Name: this.craftingTypes[source],
                    };
                } else if (source.Result) {
                    // recipe
                    let node = {
                        ItemID: source.Result._id,
                        Name: source.Result.Name,
                        Icon: source.Result.Icon,
                        Quantity: source.Amount_Result,
                        Ingredients: [],
                    };
                    for (let i = 0; i < source.Item_Ingredient.length; i++) {
                        if (source.Item_Ingredient[i] > 0) {
                            node.Ingredients.push({
                                ItemID: source.Item_Ingredient[i],
                                Item: source.Ingredients[i],
                                Amount: source.Amount_Ingredient[i],
                            });
                        }
                    }
                    return node;
                } else if (source.Name) {
                    // item
                    return {
                        ItemID: source._id,
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
            hasNode: function(id) {
                return this.nodes.findIndex(n => n.ItemID === id) >= 0;
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
                await this.addRecipe(value);
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
                    this.addRecipeNode(this.recipes[i]);
                }
            },
            switchView: function(item) {
                if (item.active) {
                    if (item.name === "diagram") {
                        document
                            .getElementById("sankeyDiagram")
                            .classList.remove("d-none");
                        document
                            .getElementById("shoppingList")
                            .classList.add("d-none");
                        document
                            .getElementById("craftingGuide")
                            .classList.add("d-none");
                    } else if (item.name === "list") {
                        document
                            .getElementById("sankeyDiagram")
                            .classList.add("d-none");
                        document
                            .getElementById("shoppingList")
                            .classList.remove("d-none");
                        document
                            .getElementById("craftingGuide")
                            .classList.add("d-none");
                    } else {
                        document
                            .getElementById("sankeyDiagram")
                            .classList.add("d-none");
                        document
                            .getElementById("shoppingList")
                            .classList.add("d-none");
                        document
                            .getElementById("craftingGuide")
                            .classList.remove("d-none");
                    }
                }
            }
        },
    };
</script>
