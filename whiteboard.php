<?php
namespace Grav\Theme;

use Grav\Common\Theme;


class Whiteboard extends Theme
{

    /**
     * @return array
     *
     * The getSubscribedEvents() gives the core a list of events
     *     that the plugin wants to listen to. The key of each
     *     array section is the event that the plugin listens to
     *     and the value (in the form of an array) contains the
     *     callable (or function) as well as the priority. The
     *     higher the number the higher the priority.
     */
    public static function getSubscribedEvents()
    {
        return [
            'onThemeInitialized' => ['onThemeInitialized', 0]
        ];
    }

    public function onThemeInitialized()
    {
        if ($this->isAdmin()) {
            $this->active = false;
            return;
        }

        $this->enable([
            'onTwigSiteVariables' => ['onTwigSiteVariables', 0]
        ]);
    }

    public function onTwigSiteVariables()
    {
        $mode = '';
        $whiteboard_bits = [];
        $owl_carousel_bits = [];

        $assets = $this->grav['assets'];
        $configSystemDebugger = $this->grav['config']->get('system.debugger');
        $configThemeSettings = $this->config->get('theme.whiteboard.settings');

        if($configThemeSettings['mode'] == 'system') {
            if($configSystemDebugger['debugger']) {
                $mode = '.min';
            }
        } else if($configThemeSettings['mode'] == 'testing') {
            $mode = '.min';
        }

        $whiteboard_bits[] = "theme://assets/css/vendor/whiteboard/whiteboard{$mode}.css";

        $assets->registerCollection('whiteboard', $whiteboard_bits);
        $assets->add('whiteboard', 1000);

        $owl_carousel_bits[] = "theme://assets/css/vendor/owl.carousel/owl.carousel{$mode}.css";
        $owl_carousel_bits[] = "theme://assets/css/vendor/owl.carousel/owl.theme.default{$mode}.css";
        $owl_carousel_bits[] = "theme://assets/js/vendor/owl.carousel/owl.carousel{$mode}.js";

        $assets->registerCollection('owl.carousel', $owl_carousel_bits);
        $assets->add('owl.carousel', 10000);

        $particle_js_bits[] = "theme://assets/js/vendor/particles.js/particles{$mode}.js";

        $assets->registerCollection('particle.js', $particle_js_bits);
        $assets->add('particle.js', 10000);

        $typed_bits[] = "theme://assets/js/vendor/typed.js/typed{$mode}.js";

        $assets->registerCollection('typed.js', $typed_bits);
        $assets->add('typed.js', 10000);
    }
}
