import { mount } from "svelte";
import CoveragePage from "./CoveragePage.svelte";
import "../styles/app.css";

const target = document.getElementById("coverage");
if (!target) throw new Error('Mount target "#coverage" not found');

const app = mount(CoveragePage, { target });

export default app;
