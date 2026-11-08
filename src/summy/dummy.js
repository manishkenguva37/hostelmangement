// // src/GlobalComponents.js
// import Vue from "vue";

// export default {
//     install() {
//         // Auto-import any .vue file from /components
//         const requireComponent = require.context(
//             "./components",
//             true,
//             /\.vue$/
//         );

//         requireComponent.keys().forEach((fileName) => {
//             const componentConfig = requireComponent(fileName);

//             // Convert file name to PascalCase
//             const componentName = fileName
//                 .split("/")
//                 .pop()
//                 .replace(/\.\w+$/, "");

//             Vue.component(componentName, componentConfig.default || componentConfig);
//         });
//     }
// };