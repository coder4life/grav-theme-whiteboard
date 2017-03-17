<?php
namespace Grav\Theme;

use Grav\Common\Theme;

class Whiteboard extends Theme
{
    /**
     * @return array
     */
    public static function getSubscribedEvents()
    {
        return [
            'onTwigExtensions' => ['onTwigExtensions', 0],
            'onPageInitialized' => ['onPageInitialized', 0]
        ];
    }
}
