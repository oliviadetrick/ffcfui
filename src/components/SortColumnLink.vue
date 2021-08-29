<template>
    <a href="#" class="btn btn-sm btn-outline-dark" v-on:click="onClick">
        <span class="col-head-check" v-bind:title="title"> <i v-bind:class="icon"></i>&nbsp;{{ text }} </span>
    </a>
</template>

<script>
    export default {
        name: "SortColumnLink",
        props: {
            alphabetic: {
                type: Boolean,
                default: false,
            },
            columnName: String,
            text: String,
            title: String,
        },
        data: function() {
            return {
                sortDirection: null,
            };
        },
        computed: {
            icon: function() {
                if (this.sortDirection === "asc") {
                    return this.alphabetic ? "bi bi-sort-alpha-down" : "bi bi-sort-down";
                } else if (this.sortDirection === "desc") {
                    return this.alphabetic ? "bi bi-sort-alpha-up" : "bi bi-sort-up";
                } else {
                    return "";
                }
            },
        },
        methods: {
            onClick: function() {
                this.$emit("click", this);
            },
        },
    };
</script>
