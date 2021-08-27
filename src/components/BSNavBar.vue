<template>
    <nav
        class="navbar navbar-expand-lg"
        v-bind:class="navClass ? navClass : ''">
        <div class="container">
            <a class="navbar-brand" href="#">{{ navBrand }}</a>
            <button
                class="navbar-toggler"
                type="button"
                data-bs-toggle="collapse"
                v-bind:data-bs-target="'#' + toggleId"
                v-bind:aria-controls="toggleId"
                aria-expanded="false"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" v-bind:id="toggleId">
                <slot></slot>
            </div>
        </div>
    </nav>
</template>

<script>
    export default {
        name: "BSNavBar",
        props: {
            navClass: String,
            navBrand: String,
            toggleId: String,
        },
    };
</script>
