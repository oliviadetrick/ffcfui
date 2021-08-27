{
    addRecipe: function(recipe) {
        let resultNode = this.getOrCreateNode(recipe.Result, false);
        let craftNode = this.createNode(recipe.CraftType);
        this.pushNode(craftNode);
        this.links.push(
            this.createLink(
                craftNode,
                resultNode,
                recipe.Amount_Result
            )
        );
        for (let i = 0; i < recipe.Ingredients.length; i++) {
            let ingredient = recipe.Ingredients[i];
            let ingredientNode = this.getOrCreateNode(ingredient, true);
            this.links.push(
                this.createLink(
                    ingredientNode,
                    craftNode,
                    ingredient.Amount
                )
            );
        }
        return resultNode;
    },
    createNode: function(source) {
        if (typeof source === "number") {
            // crafting
            this.craftingIndex = this.craftingIndex - 1;
            return {
                ItemID: this.craftingIndex,
                Name: this.craftingTypes[source],
            };
        } else {
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
    getOrCreateNode: function(ingredient, checkRecipe) {
        let node = this.getNode(ingredient.ItemID);
        if(node === null) {
            if (ingredient.Item.Recipe && checkRecipe) {
                node = this.addRecipe(ingredient.Item.Recipe);
            } else {
                node = this.createNode(ingredient.Item);
                this.pushNode(node);
            }
        }
        return node;
    },
    loadRecipe: async function(id) {
        if (this.recipes.findIndex(r => r._id === id) < 0) {
            let data = await json("http://localhost:3000/recipe/" + id);
            if (data !== undefined) {
                this.recipes.push(data);
                this.addRecipe(data);
            }
        }
    },
}