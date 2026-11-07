import StatsPlugin from '@svgframe/plugin-command-stats';
import type {PluginInstaller} from '../loading/PluginInstaller.js';
import {PluginLoader} from '../loading/PluginLoader.js';
/** Optional plugins for mode A; mode B resolves the same packages from configuration. */
export function installCodePlugins(installer:PluginInstaller):readonly string[]{
  const loader=new PluginLoader(installer);
  return installer.install(StatsPlugin,loader.manifest(import.meta.resolve('@svgframe/plugin-command-stats')));
}
