<template>
    <form class="d-flex" v-bind:id="id">
        <Multiselect
            v-bind:id="'ac-' + id"
            v-on:select="onSelect"
            placeholder="Search"
            :filterResults="false"
            :minChars="3"
            :resolveOnLoad="false"
            :delay="250"
            :searchable="true"
            :options="async function(query) {
                    return await search(query);
                }"
            :classes="{
                search: 'multiselect-search form-control',
                noOptions: 'visually-hidden',
            }"
        />
    </form>
</template>

<script>
    import Multiselect from "@vueform/multiselect";
    import { json } from "d3";

    export default {
        name: "BSNavSearch",
        props: {
            id: String,
        },
        components: {
            Multiselect,
        },
        methods: {
            onSelect: function(value, option) {
                this.$emit("select", value, option);
            },
            search: async function(query) {
                let data = await json(
                    "https://xivapi.com/search?indexes=recipe&string=" + query
                );
                return data.Results.map(i => {
                    return { value: i.ID, label: i.Name };
                });
            },
        },
    };
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style>
    .multiselect-search {
        position: static;
    }
</style>
