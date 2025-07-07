<ul class="tree">
	<li>
		<details open>
			<summary>Giant planets</summary>
			<ul>
				<li>
					<details>
						<summary>Gas giants</summary>
						<ul>
							<li>Jupiter</li>
							<li>Saturn</li>
						</ul>
					</details>
				</li>
				<li>
					<details>
						<summary>Ice giants</summary>
						<ul>
							<li>Uranus</li>
							<li>Neptune</li>
						</ul>
					</details>
				</li>
			</ul>
		</details>
	</li>
</ul>

<style>
/*
 *  https://iamkate.com/code/tree-views/
 *
 *  Tree views in css
 *
 * A tree view (collapsible list) can be created using only html and css, without the
 *  need for JavaScript. Accessibility software will see the tree view as lists nested
 *  inside disclosure widgets, and the standard keyboard interaction is supported automatically.
 */
.tree{
	--spacing : 1.5rem;
	--radius  : 10px;
}
.tree li{
	display      : block;
	position     : relative;
	padding-left : calc(2 * var(--spacing) - var(--radius) - 2px);
}

.tree ul{
	margin-left  : calc(var(--radius) - var(--spacing));
	padding-left : 0;
}
.tree ul li{
	border-left : 2px solid #ddd;
}

.tree ul li:last-child{
	border-color : transparent;
}
.tree ul li::before{
	content      : '';
	display      : block;
	position     : absolute;
	top          : calc(var(--spacing) / -2);
	left         : -2px;
	width        : calc(var(--spacing) + 2px);
	height       : calc(var(--spacing) + 1px);
	border       : solid #ddd;
	border-width : 0 0 2px 2px;
}
.tree summary{
	display : block;
	cursor  : pointer;
}

.tree summary::marker,
.tree summary::-webkit-details-marker{
	display : none;
}

.tree summary:focus{
	outline : none;
}

.tree summary:focus-visible{
	outline : 1px dotted #000;
}
/*We use generated content again to create the markers:*/
.tree li::after,
.tree summary::before{
	content       : '';
	display       : block;
	position      : absolute;
	top           : calc(var(--spacing) / 2 - var(--radius));
	left          : calc(var(--spacing) - var(--radius) - 1px);
	width         : calc(2 * var(--radius));
	height        : calc(2 * var(--radius));
	border-radius : 50%;
	background    : #ddd;
}
/*Finally, we add the expand and collapse buttons:*/
.tree summary::before{
	content     : '+';
	z-index     : 1;
	background  : #696;
	color       : #fff;
	line-height : calc(2 * var(--radius) - 2px);
	text-align  : center;
}

.tree details[open] > summary::before{
	content : '−';
}
</style>

<script lang="ts">
</script>
