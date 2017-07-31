<?php
namespace Grav\Theme;

use Grav\Common\Theme;

class Whiteboard extends Theme
{
    /**
     * @return array
     */
    /*public static function getSubscribedEvents()
    {
        return [
            'onPluginsInitialized'  => ['onPluginsInitialized', 0]
        ];
    }

    public function onTwigSiteVariables()
    {
        // Load CSS Assets
        if ($this->config->get('system.debugger.enabled')) {
            $this->grav['assets']
                ->addCss('theme://css-compiled/owlcarousel2.css', 100)
                ->addCss('theme://css-compiled/font-awesome.css', 101)
                ->addCss('theme://css-compiled/bootstrap.css', 105)
                ->addCss('theme://css-compiled/whiteboard.css', 110);
        } else{
            $this->grav['assets']
                ->addCss('theme://css-compiled/owlcarousel2.min.css', 100)
                ->addCss('theme://css-compiled/font-awesome.min.css', 101)
                ->addCss('theme://css-compiled/bootstrap.min.css', 105)
                ->addCss('theme://css-compiled/whiteboard.min.css', 110);
        }

        // Load JS Assets
        if ($this->config->get('system.debugger.enabled')) {
            $this->grav['assets']
                ->addJs('theme://js-compiled/typed.js', 101)
                ->addJs('theme://js-compiled/particles.js', 102)
                ->addJs('theme://js-compiled/owlcarousel2.js', 103)
                ->addJs('theme://js-compiled/bootstrap.js', 105)
                ->addJs('theme://js-compiled/tether.js', 106);
        } else {
            $this->grav['assets']
                ->addJs('theme://js-compiled/typed.min.js', 101)
                ->addJs('theme://js-compiled/particles.min.js', 102)
                ->addJs('theme://js-compiled/owlcarousel2.min.js', 103)
                ->addJs('theme://js-compiled/bootstrap.min.js', 105)
                ->addJs('theme://js-compiled/tether.min.js', 106);
        }

        $this->grav['assets']
            ->add('jquery', 101);

    }*/
}
