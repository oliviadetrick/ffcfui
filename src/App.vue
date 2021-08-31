<template>
    <BSNavBar nav-brand="FFXIV Crafting Calculator" nav-class="navbar-dark" toggle-id="nav-main">
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
            v-show="!views[0].active"
        />
        <ShoppingList id="shoppingList" :nodes="shoppingData" v-on:sort="onShoppingSorted" v-show="views[1].active" />
        <CraftingGuide id="craftingGuide" :nodes="nodes" :links="links" v-show="views[2].active" />
        <CraftingDiagram id="sankeyDiagram" :nodes="nodes" :links="links" v-show="views[3].active" />
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
        created: async function() {
            const searchParams = new URLSearchParams(window.location.search);
            let i = 0;
            let value = searchParams.get(`i${i}`);
            while (value !== null) {
                let recipe = await this.getRecipe(value);
                if (recipe != null) {
                    await this.addRecipe(recipe);
                    let m = parseInt(searchParams.get(`a${i}`));
                    if (m !== m) {
                        m = 1;
                    }
                    recipe.Multiplier = m;
                }
                value = searchParams.get(`i${++i}`);
            }
            if (i > 0) {
                this.views[0].active = false;
                this.views[1].active = true;
            }
        },
        data: function() {
            return {
                craftingIndex: 0,
                nodeIDs: [],
                nodes: [],
                recipes: [],
                recipeCache: [],
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
                                ? (a, b) => a.value - b.value || a.Name.localeCompare(b.Name)
                                : (a, b) => b.value - a.value || b.Name.localeCompare(a.Name);
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
            addRecipe: async function(recipe) {
                let recipeNode = this.getNode(recipe.ID);
                if(recipeNode === null) {
                    recipeNode = this.createNode(recipe);
                    recipeNode.Resource = false;
                    recipeNode.CraftNode = this.createCraftNode(recipe.CraftType);
                    this.createLink(recipeNode.CraftNode, recipeNode, recipe.AmountResult * recipe.Multiplier);
                }
                let ingredientNode = null;
                for (let i = 0; i <= 9; i++) {
                    let amount = parseInt(recipe["AmountIngredient" + i]);
                    if(amount > 0) {
                        let ingredientRecipe = recipe["ItemIngredientRecipe" + i];
                        if(typeof ingredientRecipe === "object" && ingredientRecipe !== null) {
                            if(Array.isArray(ingredientRecipe)) {
                                ingredientRecipe = ingredientRecipe[0];
                            }
                            ingredientRecipe = await this.getRecipe(ingredientRecipe.ID);
                            ingredientRecipe.Multiplier = recipe.Multiplier * amount;
                            ingredientNode = await this.addRecipe(ingredientRecipe);
                        } else {
                            let ingredient = recipe["ItemIngredient" + i];
                            if(typeof ingredient === "object" && ingredient !== null) {
                                ingredientNode = this.getOrCreateNode(ingredient);
                            }
                        }
                        if (ingredientNode !== null) {
                            this.createLink(
                                ingredientNode,
                                recipeNode.CraftNode,
                                amount * recipe.Multiplier
                            );
                        }
                    }
                }
                return recipeNode;
            },
            addRecipeToShoppingList: async function(id) {
                let i = this.recipes.findIndex(r => r.ID === id);
                if (i < 0){
                    i = this.recipeCache.findIndex(r => r.ID === id);
                }
                if (i < 0) {
                    let data = await json("https://xivapi.com/recipe/" + id);
                    if (typeof data === "object") {
                        if (this.views[0].active) {
                            this.views[0].active = false;
                            this.views[1].active = true;
                        }
                        data.Multiplier = 1;
                        this.recipes.push(data);
                        this.recipeCache.push(data);
                        await this.addRecipe(data);
                        this.updateURL();
                        return data;
                    }
                    return null;
                }
                return this.recipes[i];
            },
            createCraftNode: function(source) {
                this.craftingIndex = this.craftingIndex - 1;
                let node =  {
                    ItemID: this.craftingIndex,
                    Name: source.Name,
                };
                this.pushNode(node);
                return node;
            },
            createLink: function(source, target, value) {
                let link = {
                    source: source.ItemID,
                    target: target.ItemID,
                    value: value,
                };
                this.links.push(link);
                return link;
            },
            createNode: function(source) {
                let node = {
                    ItemID: source.ID,
                    Name: source.Name,
                    Description: source.Description,
                    Resource: typeof source.Recipe === "undefined",
                    Icon: source.Icon,
                };
                this.pushNode(node);
                return node;
            },
            getNode: function(id) {
                let i = this.nodes.findIndex(n => n.ItemID === id);
                return i >= 0 ? this.nodes[i] : null;
            },
            getOrCreateNode: function(ingredient) {
                let node = this.getNode(ingredient.ID);
                if (node === null) {
                    node = this.createNode(ingredient);
                }
                return node;
            },
            getRecipe: async function(id) {
                let i = this.recipeCache.findIndex(r => r.ID === id);
                if (i < 0) {
                    let data = await json("https://xivapi.com/recipe/" + id);
                    if (typeof data === "object") {
                        data.Multiplier = 1;
                        this.recipeCache.push(data);
                        return data;
                    }
                    return null;
                }
                return this.recipeCache[i];
            },
            onRecipeChanged: async function(recipe, newValue) {
                let i = this.recipeCache.indexOf(recipe);
                if (i >= 0 && recipe.Multiplier > 0) {
                    this.recipeCache[i].Multiplier = newValue;
                    await this.rebuild();
                }
            },
            onRecipeRemoved: async function(recipe) {
                let i = this.recipes.indexOf(recipe);
                if (i >= 0) {
                    this.recipes.splice(i, 1);
                    await this.rebuild();
                }
            },
            onSelectRecipe: async function(value) {
                await this.addRecipeToShoppingList(value);
            },
            onShoppingSorted: function(columnLink) {
                if (!(columnLink instanceof PointerEvent)) {
                    let sortInfo = this.sortInfo.shopping[columnLink.columnName];
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
            rebuild: async function() {
                this.links.splice(0, this.links.length);
                this.nodes.splice(0, this.nodes.length);
                this.nodeIDs.splice(0, this.nodeIDs.length);
                this.recipeCache.splice(0, this.recipeCache.length);
                this.craftingIndex = 0;
                for (let i = 0; i < this.recipes.length; i++) {
                    await this.addRecipe(this.recipes[i]);
                }
                this.updateURL();
            },
            updateURL: function() {
                let query = "";
                let i = 0;
                this.recipes.forEach(r => {
                    query = query + (i === 0 ? "?" : "&");
                    query = query + `i${i}=${r.ID}&a${i}=${r.Multiplier}`;
                    i++;
                });
                if (query.length === 0) {
                    window.history.replaceState(null, null, "?");
                } else {
                    window.history.replaceState(null, null, query);
                }
            },
        },
    };
</script>
