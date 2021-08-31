<template>
    <div class="text-light">
        <h1 class="display-6">Welcome :3</h1>
        <p>
            This app is inspired by the countless factory game calculators out there for games like Factorio,
            Satisfactory, etc. that are sooo helpful when trying to figure out what you need when building your stuff.
        </p>
        <p>
            I was shocked to find that nothing like this existed for FF14 when I started crafting since I had grown
            accustomed to being able to use one of these and instantly knowing how much of what and in what order I
            needed them in.
        </p>
        <p>
            I made this entirely from scratch but this site is <em>heavily</em> inspired by the wonderful
            <a href="https://kirkmcdonald.github.io/" class="link-info">kirkmcdonald.github.io</a>
            so please check that out ~!
        </p>
        <hr />
        <h1 class="display-6">Changelog</h1>
        <dl>
            <dt>2020/08/31</dt>
            <dd>
                Quantity fields should work again
                (<a href="https://github.com/oliviadetrick/ffcfui/issues/3" class="link-info">#3</a>)
            </dd>
            <dt>2020/08/30</dt>
            <dd>
                Recipes that contain recipes should work now
                (<a href="https://github.com/oliviadetrick/ffcfui/issues/2" class="link-info">#2</a>)
            </dd>
            <dd>Added highlighting to links when you hover over them. This will likely change in the future.</dd>
        </dl>
        <hr />
        <p>
            Check out the source code on
            <a href="https://github.com/oliviadetrick/ffcfui" class="link-info">Github</a>!
        </p>
    </div>
</template>

<script>
    export default {
        name: "Index",
    };
</script>
