export default {
	props: {
		todo: Object
	},
	methods: {
		hi() {
			console.log("hi")
		}
	},
	template: `
		<li>{{ todo.text }} 		<button @click="hi">hi</button></li>

	`
}
