<?php

namespace Whiteboard\Twig;

/**
 * Class GravstrapTwigExtension adds some function to Twig
 *
 * @author Giansimon Diblas
 */
class GravstrapTwigExtension extends \Twig_Extension
{
    /**
     * Returns extension name.
     *
     * @return string
     */
    public function getName()
    {
        return 'WhiteboardTwigExtension';
    }

    /**
     * {@inheritdoc}
     */
    public function getFunctions()
    {
        return [
            new \Twig_SimpleFunction('instanceof', [$this, 'instance_of']),
            new \Twig_SimpleFunction('parse_attributes', [$this, 'parseAttributes']),
        ];
    }

    /**
     * Implements PHP instanceof function for Twig
     *
     * @param mixed $object
     * @param string $class
     * @return type
     */
    public function instance_of($object, $class)
    {
        return $object instanceof $class;
    }

    /**
     * Parses attributes given as string and returns an array
     * The given input attributes string is given as a comma separated values string and each keypair combination is separated by a colon. An example is class:my-class,rel=my-rel
     * @param string $tagsString
     * @return array
     * @throws \InvalidArgumentException
     */
    public function parseAttributes($tagsString)
    {
        $res = array();
        if (null === $tagsString || !is_string($tagsString)) {
            return $res;
        }

        $tags = explode(',', $tagsString);
        foreach($tags as $tag)
        {
            $tokens = explode(':', $tag);
            if (count($tokens) != 2) {
                throw new \InvalidArgumentException(sprintf('The attribute "%s" is not valid. Attribute string must be made by key:value pairs, separated by colons', $tagsString));
            }

            $res[$tokens[0]] = $tokens[1];
        }

        return $res;
    }
}
